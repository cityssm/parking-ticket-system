import type { Request, Response } from 'express'

import { getParkingOffences } from '../../database/parkingDB/getParkingOffences.js'

export default function handler(_request: Request, response: Response): void {
  response.json(getParkingOffences())
}
