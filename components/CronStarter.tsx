// Cron Job Starter
// Initialize background jobs when server starts

import { initializeCronJobs } from '@/lib/cron-jobs'

// Initialize cron jobs when this module is imported
if (process.env.NODE_ENV !== 'test') {
  initializeCronJobs()
}

export default function CronStarter() {
  // This component doesn't render anything, just initializes cron jobs
  return null
}