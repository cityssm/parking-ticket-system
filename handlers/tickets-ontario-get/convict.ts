import type { RequestHandler } from 'express'

import * as parkingDB_ontario from '../../database/parkingDB-ontario.js'

import { getConvictionBatch } from '../../database/parkingDB/getConvictionBatch.js'

export const handler: RequestHandler = (_request, response) => {
  const tickets =
    parkingDB_ontario.getParkingTicketsAvailableForMTOConvictionBatch()

  const batch = getConvictionBatch(-1)

  response.render('mto-ticketConvict', {
    headTitle: 'Convict Parking Tickets',
    tickets,
    batch
  })
}

export default handler
