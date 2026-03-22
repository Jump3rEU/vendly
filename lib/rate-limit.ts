// Rate Limiting Utility
// Uses Redis when available, falls back to in-memory store

import Redis from 'ioredis'

interface RateLimitConfig {
  interval: number // milliseconds
  uniqueTokenPerInterval: number // max requests
}

// Redis client (singleton)
let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis
  
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) return null
  
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null
        return Math.min(times * 100, 3000)
      },
      lazyConnect: true,
    })
    
    redis.on('error', (err) => {
      console.warn('Redis connection error, falling back to in-memory:', err.message)
      redis = null
    })
    
    return redis
  } catch {
    return null
  }
}

// In-memory fallback
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export class RateLimiter {
  private config: RateLimitConfig
  private prefix: string

  constructor(config: RateLimitConfig = { interval: 60000, uniqueTokenPerInterval: 10 }, prefix = 'rl') {
    this.config = config
    this.prefix = prefix
  }

  async check(identifier: string): Promise<{ success: boolean; remaining: number }> {
    const redisClient = getRedis()
    
    if (redisClient) {
      return this.checkRedis(redisClient, identifier)
    }
    
    return this.checkMemory(identifier)
  }

  private async checkRedis(client: Redis, identifier: string): Promise<{ success: boolean; remaining: number }> {
    const key = `${this.prefix}:${identifier}`
    const intervalSeconds = Math.ceil(this.config.interval / 1000)
    
    try {
      const current = await client.incr(key)
      
      if (current === 1) {
        await client.expire(key, intervalSeconds)
      }
      
      const remaining = Math.max(0, this.config.uniqueTokenPerInterval - current)
      const success = current <= this.config.uniqueTokenPerInterval
      
      return { success, remaining }
    } catch {
      // Fallback to memory on Redis error
      return this.checkMemory(identifier)
    }
  }

  private checkMemory(identifier: string): { success: boolean; remaining: number } {
    const now = Date.now()
    const record = rateLimitMap.get(identifier)

    if (!record || now > record.resetTime) {
      rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + this.config.interval
      })
      return { success: true, remaining: this.config.uniqueTokenPerInterval - 1 }
    }

    if (record.count >= this.config.uniqueTokenPerInterval) {
      return { success: false, remaining: 0 }
    }

    record.count++
    return { success: true, remaining: this.config.uniqueTokenPerInterval - record.count }
  }
}

// Default rate limiters
export const authRateLimiter = new RateLimiter({ interval: 60000, uniqueTokenPerInterval: 5 }, 'auth')
export const apiRateLimiter = new RateLimiter({ interval: 60000, uniqueTokenPerInterval: 60 }, 'api')
export const uploadRateLimiter = new RateLimiter({ interval: 60000, uniqueTokenPerInterval: 10 }, 'upload')
