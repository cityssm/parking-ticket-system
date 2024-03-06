import type { Request, Response } from 'express'

import deleteParkingBylaw from '../../database/parkingDB/deleteParkingBylaw.js'
import { getParkingBylawsWithOffenceStats } from '../../database/parkingDB/getParkingBylaws.js'

export default function handler(request: Request, response: Response): void {
  const results = deleteParkingBylaw(request.body.bylawNumber as string)

  if (results.success) {
    results.bylaws = getParkingBylawsWithOffenceStats()
  }

  response.json(results)
}
