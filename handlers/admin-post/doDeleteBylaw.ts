import type { RequestHandler } from 'express'

import { getParkingBylawsWithOffenceStats } from '../../database/parkingDB/getParkingBylaws.js'
import { deleteParkingBylaw } from '../../database/parkingDB/deleteParkingBylaw.js'

export const handler: RequestHandler = (request, response) => {
  const results = deleteParkingBylaw(request.body.bylawNumber)

  if (results.success) {
    results.bylaws = getParkingBylawsWithOffenceStats()
  }

  return response.json(results)
}

export default handler
