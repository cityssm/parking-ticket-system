import type { Request, Response } from 'express'

import getParkingOffences from '../../database/parkingDB/getParkingOffences.js'
import {
  getParkingBylaws,
  getParkingLocations
} from '../../helpers/functions.cache.js'

export default function handler(_request: Request, response: Response): void {
  const locations = getParkingLocations()
  const bylaws = getParkingBylaws()
  const offences = getParkingOffences()

  response.render('offence-maint', {
    headTitle: 'Parking Offences',
    locations,
    bylaws,
    offences
  })
}
