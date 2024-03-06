import type { Request, Response } from 'express'

import createParkingTicketStatus from '../../database/parkingDB/createParkingTicketStatus.js'
import getLicencePlateOwner from '../../database/parkingDB/getLicencePlateOwner.js'
import { getFormattedOwnerAddress } from '../../helpers/functions.owner.js'

export default async function handler(
  request: Request,
  response: Response
): Promise<void> {
  const ownerRecord = await getLicencePlateOwner(
    request.body.licencePlateCountry as string,
    request.body.licencePlateProvince as string,
    request.body.licencePlateNumber as string,
    Number.parseInt(request.body.recordDate as string, 10)
  )

  if (ownerRecord === undefined) {
    response.json({
      success: false,
      message: 'Ownership record not found.'
    })
    return
  }

  const ownerAddress = getFormattedOwnerAddress(ownerRecord)

  const statusResponse = createParkingTicketStatus(
    {
      recordType: 'status',
      ticketId: Number.parseInt(request.body.ticketId as string, 10),
      statusKey: 'ownerLookupMatch',
      statusField: ownerRecord.recordDate.toString(),
      statusNote: ownerAddress
    },
    request.session.user as PTSUser,
    false
  )

  response.json(statusResponse)
}
