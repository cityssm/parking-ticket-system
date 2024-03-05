import type { Request, Response } from 'express'

import { getDatabaseCleanupCounts } from '../../database/parkingDB/getDatabaseCleanupCounts.js'

export default function handler(_request: Request, response: Response): void {
  const counts = getDatabaseCleanupCounts()

  response.render('admin-cleanup', {
    headTitle: 'Database Cleanup',
    counts
  })
}
