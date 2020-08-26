"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const ownerFns = require("../../helpers/ownerFns");
const parkingDB_createParkingTicketStatus = require("../../helpers/parkingDB/createParkingTicketStatus");
const parkingDB_getOwnershipReconciliationRecords = require("../../helpers/parkingDB/getOwnershipReconciliationRecords");
exports.handler = (req, res) => {
    const records = parkingDB_getOwnershipReconciliationRecords.getOwnershipReconciliationRecords();
    const statusRecords = [];
    for (const record of records) {
        if (!record.isVehicleMakeMatch || !record.isLicencePlateExpiryDateMatch) {
            continue;
        }
        const ownerAddress = ownerFns.getFormattedOwnerAddress(record);
        const statusResponse = parkingDB_createParkingTicketStatus.createParkingTicketStatus({
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
