import type { Request, Response } from 'express'

import { getParkingOffencesByLocationKey } from '../../database/parkingDB/getParkingOffences.js'

export default function handler(request: Request, response: Response): void {
  response.json(
    getParkingOffencesByLocationKey(request.body.locationKey as string)
  )
}
