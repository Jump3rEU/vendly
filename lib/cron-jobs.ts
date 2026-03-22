// Cron Jobs
// Background tasks for escrow auto-release, reminders, and maintenance

import { Queue, Worker, Job } from 'bullmq'
import { Redis } from 'ioredis'
import { prisma } from '@/lib/prisma'
import { OrderStatus, PaymentStatus } from '@prisma/client'
import { sendConfirmDeliveryReminderEmail, sendOrderCompletedEmail } from '@/lib/email'

// Redis connection for BullMQ
let redis: Redis | null = null

function getRedisConnection(): Redis | null {
  if (redis) return redis
  
  if (!process.env.REDIS_URL) {
    console.log('⚠️ Redis not configured, running in fallback mode')
    return null
  }

  try {
    redis = new Redis(process.env.REDIS_URL, {
      connectTimeout: 10000,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    })
    console.log('✅ Redis connected for background jobs')
  } catch (error) {
    console.log('❌ Redis connection failed:', error)
    return null
  }
  
  return redis
}

// Create job queues
let escrowQueue: Queue | null = null
let reminderQueue: Queue | null = null
let cleanupQueue: Queue | null = null

function getQueues() {
  const redisConnection = getRedisConnection()
  if (!redisConnection) return { escrowQueue: null, reminderQueue: null, cleanupQueue: null }

  try {
    if (!escrowQueue) {
      escrowQueue = new Queue('escrow-jobs', { connection: redisConnection })
    }
    if (!reminderQueue) {
      reminderQueue = new Queue('reminder-jobs', { connection: redisConnection })
    }
    if (!cleanupQueue) {
      cleanupQueue = new Queue('cleanup-jobs', { connection: redisConnection })
    }

    return { escrowQueue, reminderQueue, cleanupQueue }
  } catch (error) {
    console.log('❌ Failed to create job queues:', error)
    return { escrowQueue: null, reminderQueue: null, cleanupQueue: null }
  }
}

// ==============================================
// ESCROW JOBS
// ==============================================

// Schedule auto-release job for 7 days after shipment
export async function scheduleAutoRelease(orderId: string, releaseDate: Date) {
  const { escrowQueue } = getQueues()
  if (!escrowQueue) {
    console.log('⚠️ Cannot schedule auto-release: Redis not available')
    return
  }
  
  await escrowQueue.add(
    'auto-release',
    { orderId },
    {
      delay: releaseDate.getTime() - Date.now(),
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    }
  )
}

// Worker for auto-release
let escrowWorker: Worker | null = null

function createEscrowWorker() {
  const redisConnection = getRedisConnection()
  if (!redisConnection || escrowWorker) return escrowWorker
  
  try {
    escrowWorker = new Worker('escrow-jobs', async (job: Job) => {
    const { orderId } = job.data

    console.log(`Processing auto-release for order: ${orderId}`)

    // Fetch order with current status
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        buyer: true,
        seller: true,
        listing: true,
      }
    })

    if (!order) {
      console.log(`Order ${orderId} not found, skipping auto-release`)
      return
    }

    // Only auto-release if still in shipped status and payment is held
    if (
      order.status !== OrderStatus.SHIPPED || 
      order.payment?.status !== PaymentStatus.HELD
    ) {
      console.log(`Order ${orderId} not eligible for auto-release (status: ${order.status}, payment: ${order.payment?.status})`)
      return
    }

    // Auto-release: mark as delivered and release payment
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.DELIVERED,
          deliveredAt: new Date(),
          // autoReleasedAt: new Date(), // TODO: Add this field to schema
        }
      })

      // Release payment
      await tx.payment.update({
        where: { orderId },
        data: {
          status: PaymentStatus.RELEASED,
          releasedAt: new Date(),
        }
      })

      // Update seller stats
      await tx.user.update({
        where: { id: order.sellerId },
        data: {
          totalSales: { increment: 1 },
        }
      })

      // Update buyer stats  
      await tx.user.update({
        where: { id: order.buyerId },
        data: {
          totalPurchases: { increment: 1 },
        }
      })
    })

    // Send completion email to seller
    const platformFee = Number(process.env.PLATFORM_FEE_PERCENTAGE || 5) / 100
    const sellerAmount = parseFloat(order.listing.price.toString()) * (1 - platformFee)
    
    await sendOrderCompletedEmail({
      sellerEmail: order.seller.email,
      sellerName: order.seller.name || 'Prodávající',
      orderId: order.orderNumber || order.id,
      listingTitle: order.listing.title,
      amount: sellerAmount,
    })

    console.log(`✅ Auto-released escrow for order ${orderId}`)
    }, { connection: redisConnection })
    
    console.log('✅ Escrow worker initialized')
  } catch (error) {
    console.log('❌ Failed to create escrow worker:', error)
    escrowWorker = null
  }

  return escrowWorker
}

// ==============================================
// REMINDER JOBS
// ==============================================

// Schedule delivery confirmation reminder (sent 2 days before auto-release)
export async function scheduleDeliveryReminder(orderId: string, reminderDate: Date) {
  const { reminderQueue } = getQueues()
  if (!reminderQueue) {
    console.log('⚠️ Cannot schedule reminder: Redis not available')
    return
  }
  
  await reminderQueue.add(
    'delivery-reminder',
    { orderId },
    {
      delay: reminderDate.getTime() - Date.now(),
      attempts: 2,
    }
  )
}

// Worker for reminders
let reminderWorker: Worker | null = null

function createReminderWorker() {
  const redisConnection = getRedisConnection()
  if (!redisConnection || reminderWorker) return reminderWorker
  
  try {
    reminderWorker = new Worker('reminder-jobs', async (job: Job) => {
    const { orderId } = job.data

    console.log(`Processing delivery reminder for order: ${orderId}`)

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        listing: true,
      }
    })

    if (!order || order.status !== OrderStatus.SHIPPED) {
      console.log(`Order ${orderId} not eligible for reminder`)
      return
    }

    // Calculate days left until auto-release
    const autoReleaseDate = order.autoReleaseAt || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    const daysLeft = Math.ceil((autoReleaseDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))

    if (daysLeft <= 0) {
      console.log(`Order ${orderId} past auto-release date`)
      return
    }

    // Send reminder email
    await sendConfirmDeliveryReminderEmail({
      buyerEmail: order.buyer.email,
      buyerName: order.buyer.name || 'Kupující',
      orderId: order.orderNumber || order.id,
      listingTitle: order.listing.title,
      daysLeft: Math.max(daysLeft, 1),
    })

    console.log(`✅ Sent delivery reminder for order ${orderId}`)
    }, { connection: redisConnection })
    
    console.log('✅ Reminder worker initialized')
  } catch (error) {
    console.log('❌ Failed to create reminder worker:', error)
    reminderWorker = null
  }

  return reminderWorker
}

// ==============================================
// CLEANUP JOBS
// ==============================================

// Daily cleanup tasks
export async function scheduleDailyCleanup() {
  const { cleanupQueue } = getQueues()
  if (!cleanupQueue) {
    console.log('⚠️ Cannot schedule cleanup: Redis not available')
    return
  }
  
  await cleanupQueue.add(
    'daily-cleanup',
    {},
    {
      repeat: { pattern: '0 2 * * *' }, // Run daily at 2 AM
      attempts: 1,
    }
  )
}

// Worker for cleanup tasks
let cleanupWorker: Worker | null = null

function createCleanupWorker() {
  const redisConnection = getRedisConnection()
  if (!redisConnection || cleanupWorker) return cleanupWorker
  
  try {
    cleanupWorker = new Worker('cleanup-jobs', async (job: Job) => {
    console.log('Running daily cleanup tasks...')

    // Clean up expired password reset tokens (if model exists)
    let expiredTokensDeleted = { count: 0 }
    try {
      // Check if passwordReset model exists
      if ('passwordReset' in prisma) {
        expiredTokensDeleted = await (prisma as any).passwordReset.deleteMany({
          where: {
            OR: [
              {
                expiresAt: {
                  lt: new Date()
                }
              },
              {
                used: true,
                usedAt: {
                  lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Delete used tokens older than 7 days
                }
              }
            ]
          }
        })
      }
    } catch (error) {
      console.log('⚠️ passwordReset model not available, skipping token cleanup')
    }

    console.log(`🗑️ Deleted ${expiredTokensDeleted.count} expired password reset tokens`)

    // Clean up old guest sessions (if any)
    // Clean up stale rate limit entries in Redis (optional)
    
    // Archive old cancelled orders (older than 90 days)
    const oldCancelledOrders = await prisma.order.updateMany({
      where: {
        status: OrderStatus.CANCELLED,
        createdAt: {
          lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        }
      },
      data: {
        // Could add archived flag or move to archive table
      }
    })

    console.log(`📦 Processed ${oldCancelledOrders.count} old cancelled orders`)

    console.log('✅ Daily cleanup completed')
    }, { connection: redisConnection })
    
    console.log('✅ Cleanup worker initialized')
  } catch (error) {
    console.log('❌ Failed to create cleanup worker:', error)
    cleanupWorker = null
  }

  return cleanupWorker
}

// ==============================================
// JOB HELPERS
// ==============================================

// Schedule jobs for a new order
export async function scheduleOrderJobs(orderId: string, autoReleaseDate: Date) {
  // Schedule auto-release
  await scheduleAutoRelease(orderId, autoReleaseDate)
  
  // Schedule reminder 2 days before auto-release
  const reminderDate = new Date(autoReleaseDate.getTime() - 2 * 24 * 60 * 60 * 1000)
  if (reminderDate.getTime() > Date.now()) {
    await scheduleDeliveryReminder(orderId, reminderDate)
  }
}

// Cancel jobs for an order (when manually confirmed or cancelled)
export async function cancelOrderJobs(orderId: string) {
  const { escrowQueue, reminderQueue } = getQueues()
  
  try {
    if (escrowQueue) {
      // Remove pending auto-release Jobs
      const jobs = await escrowQueue.getJobs(['delayed'])
      for (const job of jobs) {
        if (job.data.orderId === orderId) {
          await job.remove()
          console.log(`♻️ Cancelled auto-release job for order ${orderId}`)
        }
      }
    }

    if (reminderQueue) {
      // Remove pending reminder jobs
      const reminderJobs = await reminderQueue.getJobs(['delayed'])
      for (const job of reminderJobs) {
        if (job.data.orderId === orderId) {
          await job.remove()
          console.log(`♻️ Cancelled reminder job for order ${orderId}`)
        }
      }
    }
  } catch (error) {
    console.log('❌ Failed to cancel jobs:', error)
  }
}

// ==============================================
// SYSTEM INITIALIZATION  
// ==============================================

// Initialize all workers (call this on server startup)
export function initializeCronJobs() {
  console.log('🚀 Initializing background job workers...')
  
  // Create workers if Redis is available
  const escrowW = createEscrowWorker()
  const reminderW = createReminderWorker()
  const cleanupW = createCleanupWorker()
  
  // Schedule daily cleanup
  scheduleDailyCleanup().catch(console.error)
  
  if (escrowW || reminderW || cleanupW) {
    console.log('✅ Background job workers initialized')
  } else {
    console.log('⚠️ Background jobs disabled (Redis not available)')
  }
}

// Graceful shutdown
export async function shutdownCronJobs() {
  console.log('🛑 Shutting down background job workers...')
  
  try {
    if (escrowWorker) {
      await escrowWorker.close()
      escrowWorker = null
    }
    if (reminderWorker) {
      await reminderWorker.close()
      reminderWorker = null
    }
    if (cleanupWorker) {
      await cleanupWorker.close()
      cleanupWorker = null
    }
    
    if (redis) {
      await redis.disconnect()
      redis = null
    }
    
    console.log('✅ Background jobs shut down gracefully')
  } catch (error) {
    console.log('❌ Error during background jobs shutdown:', error)
  }
}