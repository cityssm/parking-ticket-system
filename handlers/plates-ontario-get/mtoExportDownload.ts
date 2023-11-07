import type { RequestHandler } from 'express'

import * as mtoFunctions from '../../helpers/functions.mto.js'

export const handler: RequestHandler = (request, response) => {
  const batchID = Number.parseInt(request.params.batchID, 10)

  const output = mtoFunctions.exportLicencePlateBatch(
    batchID,
    request.session.user as PTSUser
  )

  response.setHeader(
    'Content-Disposition',
    `attachment; filename=lookupBatch-${batchID.toString()}.txt`
  )
  response.setHeader('Content-Type', 'text/plain')

  response.send(output)
}

export default handler
