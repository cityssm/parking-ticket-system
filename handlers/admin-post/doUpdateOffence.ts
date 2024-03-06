import type { Request, Response } from 'express'

import { getParkingOffences } from '../../database/parkingDB/getParkingOffences.js'
import updateParkingOffence from '../../database/parkingDB/updateParkingOffence.js'
import type { ParkingOffence } from '../../types/recordTypes.js'

export default function handler(request: Request, response: Response): void {
  const results = updateParkingOffence(request.body as ParkingOffence)

  if (results.success) {
    results.offences = getParkingOffences()
  }

  response.json(results)
}
