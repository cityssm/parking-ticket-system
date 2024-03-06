import type { Request, Response } from 'express'

import getParkingLocations from '../../database/parkingDB/getParkingLocations.js'

export default function handler(_request: Request, response: Response): void {
  response.json(getParkingLocations())
}
