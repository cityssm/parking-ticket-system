import type { RequestHandler } from 'express'

import * as vehicleFunctions from '../../helpers/functions.vehicle.js'

export const handler: RequestHandler = (request, response) => {
  const makeModelList = vehicleFunctions.getModelsByMakeFromCache(
    request.body.vehicleMake
  )
  response.json(makeModelList)
}

export default handler
