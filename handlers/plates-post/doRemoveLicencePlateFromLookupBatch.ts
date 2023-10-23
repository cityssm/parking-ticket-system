import type { RequestHandler } from 'express'

import { removeLicencePlateFromLookupBatch } from '../../database/parkingDB/removeLicencePlateFromLookupBatch.js'

export const handler: RequestHandler = (request, response) => {
  const result = removeLicencePlateFromLookupBatch(
    request.body,
    request.session.user as PTSUser
  )

  return response.json(result)
}

export default handler
