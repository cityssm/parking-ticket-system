import type { Request, Response } from 'express'

import { addParkingOffence } from '../../database/parkingDB/addParkingOffence.js'
import { getParkingOffences } from '../../database/parkingDB/getParkingOffences.js'
import type { ParkingOffence } from '../../types/recordTypes.js'

export default function handler(request: Request, response: Response): void {
  const results = addParkingOffence(request.body as ParkingOffence)

  if (results.success && (request.body.returnOffences as boolean)) {
    results.offences = getParkingOffences()
  }

  response.json(results)
}
