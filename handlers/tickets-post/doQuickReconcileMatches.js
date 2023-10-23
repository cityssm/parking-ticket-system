import { createParkingTicketStatus } from '../../database/parkingDB/createParkingTicketStatus.js';
import { getOwnershipReconciliationRecords } from '../../database/parkingDB/getOwnershipReconciliationRecords.js';
import * as ownerFunctions from '../../helpers/functions.owner.js';
export const handler = (request, response) => {
    const records = getOwnershipReconciliationRecords();
    const statusRecords = [];
    for (const record of records) {
        if (!record.isVehicleMakeMatch || !record.isLicencePlateExpiryDateMatch) {
            continue;
        }
        const ownerAddress = ownerFunctions.getFormattedOwnerAddress(record);
        const statusResponse = createParkingTicketStatus({
            recordType: 'status',
            ticketID: record.ticket_ticketID,
            statusKey: 'ownerLookupMatch',
            statusField: record.owner_recordDateString,
            statusNote: ownerAddress
        }, request.session.user, false);
        if (statusResponse.success) {
            statusRecords.push({
                ticketID: record.ticket_ticketID,
                statusIndex: statusResponse.statusIndex
            });
        }
    }
    return response.json({
        success: true,
        statusRecords
    });
};
export default handler;
