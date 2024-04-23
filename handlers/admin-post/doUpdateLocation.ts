import type { Request, Response } from 'express'

import updateParkingLocation from '../../database/parkingDB/updateParkingLocation.js'
import { getParkingLocations } from '../../helpers/functions.cache.js'
import type { ParkingLocation } from '../../types/recordTypes.js'

export default function handler(request: Request, response: Response): void {
  const results = updateParkingLocation(request.body as ParkingLocation)

  if (results.success) {
    results.locations = getParkingLocations()
  }

  response.json(results)
}
