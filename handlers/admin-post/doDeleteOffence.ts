import type { Request, Response } from 'express'

import { deleteParkingOffence } from '../../database/parkingDB/deleteParkingOffence.js'
import { getParkingOffences } from '../../database/parkingDB/getParkingOffences.js'

export default function handler(request: Request, response: Response): void {
  const results = deleteParkingOffence(
    request.body.bylawNumber as string,
    request.body.locationKey as string
  )

  if (results.success) {
    results.offences = getParkingOffences()
  }

  response.json(results)
}
