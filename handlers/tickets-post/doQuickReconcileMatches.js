import * as ownerFunctions from "../../helpers/functions.owner.js";
import createParkingTicketStatus from "../../helpers/parkingDB/createParkingTicketStatus.js";
import getOwnershipReconciliationRecords from "../../helpers/parkingDB/getOwnershipReconciliationRecords.js";
export const handler = (req, res) => {
    const records = getOwnershipReconciliationRecords();
    const statusRecords = [];
    for (const record of records) {
        if (!record.isVehicleMakeMatch || !record.isLicencePlateExpiryDateMatch) {
            continue;
        }
        const ownerAddress = ownerFunctions.getFormattedOwnerAddress(record);
        const statusResponse = createParkingTicketStatus({
            recordType: "status",
            ticketID: record.ticket_ticketID,
            statusKey: "ownerLookupMatch",
            statusField: record.owner_recordDateString,
            statusNote: ownerAddress
        }, req.session, false);
        if (statusResponse.success) {
            statusRecords.push({
                ticketID: record.ticket_ticketID,
                statusIndex: statusResponse.statusIndex
            });
        }
    }
    return res.json({
        success: true,
        statusRecords
    });
};
export default handler;
