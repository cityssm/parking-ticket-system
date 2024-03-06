import type { Request, Response } from 'express'

import addParkingLocation from '../../database/parkingDB/addParkingLocation.js'
import getParkingLocations from '../../database/parkingDB/getParkingLocations.js'
import type { ParkingLocation } from '../../types/recordTypes.js'

export default function handler(request: Request, response: Response): void {
  const results = addParkingLocation(request.body as ParkingLocation)

  if (results.success) {
    results.locations = getParkingLocations()
  }

  response.json(results)
}
