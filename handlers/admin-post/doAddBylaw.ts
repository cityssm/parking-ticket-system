import type { Request, Response } from 'express'

import { addParkingBylaw } from '../../database/parkingDB/addParkingBylaw.js'
import { getParkingBylawsWithOffenceStats } from '../../database/parkingDB/getParkingBylaws.js'
import type { ParkingBylaw } from '../../types/recordTypes.js'

export default function handler(request: Request, response: Response): void {
  const results = addParkingBylaw(request.body as ParkingBylaw)

  if (results.success) {
    results.bylaws = getParkingBylawsWithOffenceStats()
  }

  response.json(results)
}
