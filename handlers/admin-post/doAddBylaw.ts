import type { RequestHandler } from 'express'

import { addParkingBylaw } from '../../database/parkingDB/addParkingBylaw.js'
import { getParkingBylawsWithOffenceStats } from '../../database/parkingDB/getParkingBylaws.js'

export const handler: RequestHandler = (request, response) => {
  const results = addParkingBylaw(request.body)

  if (results.success) {
    results.bylaws = getParkingBylawsWithOffenceStats()
  }

  return response.json(results)
}

export default handler
