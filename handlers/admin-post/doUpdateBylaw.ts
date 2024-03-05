import type { Request, Response } from 'express'

import { getParkingBylawsWithOffenceStats } from '../../database/parkingDB/getParkingBylaws.js'
import { updateParkingBylaw } from '../../database/parkingDB/updateParkingBylaw.js'
import type { ParkingBylaw } from '../../types/recordTypes.js'

export default function handler(request: Request, response: Response): void {
  const results = updateParkingBylaw(request.body as ParkingBylaw)

  if (results.success) {
    results.bylaws = getParkingBylawsWithOffenceStats()
  }

  response.json(results)
}
