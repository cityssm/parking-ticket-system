import type { RequestHandler } from 'express'

import { getParkingLocations } from '../../database/parkingDB/getParkingLocations.js'

export const handler: RequestHandler = (_request, response) => {
  const locations = getParkingLocations()

  return response.render('location-maint', {
    headTitle: 'Parking Location Maintenance',
    locations
  })
}

export default handler
