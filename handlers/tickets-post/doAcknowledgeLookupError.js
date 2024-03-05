import { acknowledgeLookupErrorLogEntry } from '../../database/parkingDB/acknowledgeLookupErrorLogEntry.js';
import createParkingTicketStatus from '../../database/parkingDB/createParkingTicketStatus.js';
import getUnacknowledgedLookupErrorLog from '../../database/parkingDB/getUnacknowledgedLookupErrorLog.js';
export const handler = (request, response) => {
    const logEntries = getUnacknowledgedLookupErrorLog(request.body.batchId, request.body.logIndex);
    if (logEntries.length === 0) {
        return response.json({
            success: false,
            message: 'Log entry not found.  It may have already been acknowledged.'
        });
    }
    const statusResponse = createParkingTicketStatus({
        recordType: 'status',
        ticketId: logEntries[0].ticketId,
        statusKey: 'ownerLookupError',
        statusField: '',
        statusNote: `${logEntries[0].errorMessage} (${logEntries[0].errorCode})`
    }, request.session.user, false);
    if (!statusResponse.success) {
        return response.json({
            success: false,
            message: 'Unable to update the status on the parking ticket.  It may have been resolved.'
        });
    }
    const success = acknowledgeLookupErrorLogEntry(request.body.batchId, request.body.logIndex, request.session.user);
    return response.json({
        success
    });
};
export default handler;
