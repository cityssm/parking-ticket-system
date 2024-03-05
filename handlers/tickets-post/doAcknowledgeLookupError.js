import acknowledgeLookupErrorLogEntry from '../../database/parkingDB/acknowledgeLookupErrorLogEntry.js';
import createParkingTicketStatus from '../../database/parkingDB/createParkingTicketStatus.js';
import getUnacknowledgedLookupErrorLog from '../../database/parkingDB/getUnacknowledgedLookupErrorLog.js';
export default function handler(request, response) {
    const batchId = Number.parseInt(request.body.batchId, 10);
    const logIndex = Number.parseInt(request.body.logIndex, 10);
    const logEntries = getUnacknowledgedLookupErrorLog(batchId, logIndex);
    if (logEntries.length === 0) {
        response.json({
            success: false,
            message: 'Log entry not found.  It may have already been acknowledged.'
        });
        return;
    }
    const statusResponse = createParkingTicketStatus({
        recordType: 'status',
        ticketId: logEntries[0].ticketId,
        statusKey: 'ownerLookupError',
        statusField: '',
        statusNote: `${logEntries[0].errorMessage} (${logEntries[0].errorCode})`
    }, request.session.user, false);
    if (!statusResponse.success) {
        response.json({
            success: false,
            message: 'Unable to update the status on the parking ticket.  It may have been resolved.'
        });
        return;
    }
    const success = acknowledgeLookupErrorLogEntry(batchId, logIndex, request.session.user);
    response.json({
        success
    });
}
