import type { RequestHandler } from 'express'

import { getParkingLocations } from '../../database/parkingDB/getParkingLocations.js'

export const handler: RequestHandler = (_request, response) => {
  response.json(getParkingLocations())
}

export default handler
