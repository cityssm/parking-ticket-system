import type { Request, Response } from 'express'

import getParkingBylaws from '../../database/parkingDB/getParkingBylaws.js'
import getParkingLocations from '../../database/parkingDB/getParkingLocations.js'
import getParkingOffences from '../../database/parkingDB/getParkingOffences.js'

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
