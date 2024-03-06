import type { Request, Response } from 'express'

import deleteParkingLocation from '../../database/parkingDB/deleteParkingLocation.js'
import getParkingLocations from '../../database/parkingDB/getParkingLocations.js'

export default function handler(request: Request, response: Response): void {
  const results = deleteParkingLocation(request.body.locationKey as string)

  if (results.success) {
    results.locations = getParkingLocations()
  }

  response.json(results)
}
