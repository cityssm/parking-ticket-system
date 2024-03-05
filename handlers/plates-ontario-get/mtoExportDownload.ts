import type { Request, Response } from 'express'

import { exportLicencePlateBatch } from '../../helpers/functions.mto.js'

export default function handler(request: Request, response: Response): void {
  const batchId = Number.parseInt(request.params.batchId, 10)

  const output = exportLicencePlateBatch(
    batchId,
    request.session.user as PTSUser
  )

  response.setHeader(
    'Content-Disposition',
    `attachment; filename=lookupBatch-${batchId.toString()}.txt`
  )
  response.setHeader('Content-Type', 'text/plain')

  response.send(output)
}
