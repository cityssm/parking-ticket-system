import type { RequestHandler } from 'express'

import { acknowledgeLookupErrorLogEntry } from '../../database/parkingDB/acknowledgeLookupErrorLogEntry.js'
import createParkingTicketStatus from '../../database/parkingDB/createParkingTicketStatus.js'
import getUnacknowledgedLookupErrorLog from '../../database/parkingDB/getUnacknowledgedLookupErrorLog.js'

export const handler: RequestHandler = (request, response) => {
  // Get log entry

  const logEntries = getUnacknowledgedLookupErrorLog(
    request.body.batchId,
    request.body.logIndex
  )

  if (logEntries.length === 0) {
    return response.json({
      success: false,
      message: 'Log entry not found.  It may have already been acknowledged.'
    })
  }

  // Set status on parking ticket

  const statusResponse = createParkingTicketStatus(
    {
      recordType: 'status',
      ticketId: logEntries[0].ticketId,
      statusKey: 'ownerLookupError',
      statusField: '',
      statusNote: `${logEntries[0].errorMessage} (${logEntries[0].errorCode})`
    },
    request.session.user as PTSUser,
    false
  )

  if (!statusResponse.success) {
    return response.json({
      success: false,
      message:
        'Unable to update the status on the parking ticket.  It may have been resolved.'
    })
  }

  // Mark log entry as acknowledged

  const success = acknowledgeLookupErrorLogEntry(
    request.body.batchId,
    request.body.logIndex,
    request.session.user as PTSUser
  )

  return response.json({
    success
  })
}

export default handler
