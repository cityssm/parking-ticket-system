import type { RequestHandler } from 'express'

import { addParkingOffence } from '../../database/parkingDB/addParkingOffence.js'
import { getParkingOffences } from '../../database/parkingDB/getParkingOffences.js'

export const handler: RequestHandler = (request, response) => {
  const results = addParkingOffence(request.body)

  if (results.success && request.body.returnOffences) {
    results.offences = getParkingOffences()
  }

  response.json(results)
}

export default handler
