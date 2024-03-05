import type { Request, Response } from 'express'

import { getParkingBylawsWithOffenceStats } from '../../database/parkingDB/getParkingBylaws.js'

export default function handler(_request: Request, response: Response): void {
  const bylaws = getParkingBylawsWithOffenceStats()

  response.render('bylaw-maint', {
    headTitle: 'By-Law Maintenance',
    bylaws
  })
}
