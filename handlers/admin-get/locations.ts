import type { Request, Response } from 'express'

import { getParkingLocations } from '../../helpers/functions.cache.js'

export default function handler(_request: Request, response: Response): void {
  const locations = getParkingLocations()

  response.render('location-maint', {
    headTitle: 'Parking Location Maintenance',
    locations
  })
}
