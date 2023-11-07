import type { RequestHandler } from 'express'
import papaparse from 'papaparse'

import * as parkingDB_reporting from '../../database/parkingDB-reporting.js'

export const handler: RequestHandler = (request, response) => {
  const reportName = request.params.reportName

  const rows = parkingDB_reporting.getReportData(
    reportName,
    request.query as Record<string, string>
  )

  if (!rows) {
    response.redirect('/reports/?error=reportNotAvailable')
    return
  }

  const csv = papaparse.unparse(rows)

  response.setHeader(
    'Content-Disposition',
    `attachment; filename=${reportName}-${Date.now().toString()}.csv`
  )

  response.setHeader('Content-Type', 'text/csv')

  response.send(csv)
}

export default handler
