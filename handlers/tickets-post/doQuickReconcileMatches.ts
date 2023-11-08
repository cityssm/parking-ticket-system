import type { RequestHandler } from 'express'

import { createParkingTicketStatus } from '../../database/parkingDB/createParkingTicketStatus.js'
import { getOwnershipReconciliationRecords } from '../../database/parkingDB/getOwnershipReconciliationRecords.js'
import { getFormattedOwnerAddress } from '../../helpers/functions.owner.js'

export const handler: RequestHandler = (request, response) => {
  const records = getOwnershipReconciliationRecords()

  const statusRecords: Array<{ ticketId: number; statusIndex: number }> = []

  for (const record of records) {
    if (!record.isVehicleMakeMatch || !record.isLicencePlateExpiryDateMatch) {
      continue
    }

    const ownerAddress = getFormattedOwnerAddress(record)

    const statusResponse = createParkingTicketStatus(
      {
        recordType: 'status',
        ticketId: record.ticket_ticketId,
        statusKey: 'ownerLookupMatch',
        statusField: record.owner_recordDateString,
        statusNote: ownerAddress
      },
      request.session.user as PTSUser,
      false
    )

    if (statusResponse.success) {
      statusRecords.push({
        ticketId: record.ticket_ticketId,
        statusIndex: statusResponse.statusIndex
      })
    }
  }

  return response.json({
    success: true,
    statusRecords
  })
}

export default handler
