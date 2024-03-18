import type { Request, Response } from 'express'
import papaparse from 'papaparse'

import { getReportData } from '../../database/parkingDB-reporting.js'
import { getConfigProperty } from '../../helpers/functions.config.js'

export default function handler(request: Request, response: Response): void {
  const reportName = request.params.reportName

  const rows = getReportData(
    reportName,
    request.query as Record<string, string>
  )

  if (!rows) {
    response.redirect(
      `${getConfigProperty(
        'reverseProxy.urlPrefix'
      )}/reports/?error=reportNotAvailable`
    )
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
