import type { Request, Response } from 'express'

import { getParkingBylawsWithOffenceStats } from '../../database/parkingDB/getParkingBylaws.js'
import updateParkingOffencesByBylawNumber, {
  type UpdateParkingOffencesByBylawNumberForm
} from '../../database/parkingDB/updateParkingOffencesByBylawNumber.js'

export default function handler(request: Request, response: Response): void {
  const results = updateParkingOffencesByBylawNumber(
    request.body as UpdateParkingOffencesByBylawNumberForm
  )

  if (results.success) {
    results.bylaws = getParkingBylawsWithOffenceStats()
  }

  response.json(results)
}
