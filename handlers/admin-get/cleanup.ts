import type { RequestHandler } from 'express'

import { getDatabaseCleanupCounts } from '../../database/parkingDB/getDatabaseCleanupCounts.js'

export const handler: RequestHandler = (_request, response) => {
  const counts = getDatabaseCleanupCounts()

  return response.render('admin-cleanup', {
    headTitle: 'Database Cleanup',
    counts
  })
}

export default handler
