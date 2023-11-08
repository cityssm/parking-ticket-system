import type { RequestHandler } from 'express'

import { createParkingTicketStatus } from '../../database/parkingDB/createParkingTicketStatus.js'
import { getLicencePlateOwner } from '../../database/parkingDB/getLicencePlateOwner.js'

export const handler: RequestHandler = (request, response) => {
  const ownerRecord = getLicencePlateOwner(
    request.body.licencePlateCountry,
    request.body.licencePlateProvince,
    request.body.licencePlateNumber,
    request.body.recordDate
  )

  if (ownerRecord === undefined) {
    return response.json({
      success: false,
      message: 'Ownership record not found.'
    })
  }

  const statusResponse = createParkingTicketStatus(
    {
      recordType: 'status',
      ticketId: Number.parseInt(request.body.ticketId, 10),
      statusKey: 'ownerLookupError',
      statusField: ownerRecord.vehicleNCIC,
      statusNote: ''
    },
    request.session.user as PTSUser,
    false
  )

  return response.json(statusResponse)
}

export default handler
