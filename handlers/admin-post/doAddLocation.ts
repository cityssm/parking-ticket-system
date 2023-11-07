import type { RequestHandler } from 'express'

import { addParkingLocation } from '../../database/parkingDB/addParkingLocation.js'
import { getParkingLocations } from '../../database/parkingDB/getParkingLocations.js'

export const handler: RequestHandler = (request, response) => {
  const results = addParkingLocation(request.body)

  if (results.success) {
    results.locations = getParkingLocations()
  }

  return response.json(results)
}

export default handler
