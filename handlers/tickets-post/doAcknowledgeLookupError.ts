import type { Request, Response } from 'express'

import acknowledgeLookupErrorLogEntry from '../../database/parkingDB/acknowledgeLookupErrorLogEntry.js'
import createParkingTicketStatus from '../../database/parkingDB/createParkingTicketStatus.js'
import getUnacknowledgedLookupErrorLog from '../../database/parkingDB/getUnacknowledgedLookupErrorLog.js'

export default function handler(request: Request, response: Response): void {
  const batchId = Number.parseInt(request.body.batchId as string, 10)
  const logIndex = Number.parseInt(request.body.logIndex as string, 10)

  // Get log entry
  const logEntries = getUnacknowledgedLookupErrorLog(batchId, logIndex)

  if (logEntries.length === 0) {
    response.json({
      success: false,
      message: 'Log entry not found.  It may have already been acknowledged.'
    })
    return
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
    response.json({
      success: false,
      message:
        'Unable to update the status on the parking ticket.  It may have been resolved.'
    })
    return
  }

  // Mark log entry as acknowledged
  const success = acknowledgeLookupErrorLogEntry(
    batchId,
    logIndex,
    request.session.user as PTSUser
  )

  response.json({
    success
  })
}
