"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_createParkingTicketStatus = require("../../helpers/parkingDB/createParkingTicketStatus");
const parkingDB_acknowledgeLookupErrorLogEntry = require("../../helpers/parkingDB/acknowledgeLookupErrorLogEntry");
const parkingDB_getUnacknowledgedLookupErrorLog = require("../../helpers/parkingDB/getUnacknowledgedLookupErrorLog");
exports.handler = (req, res) => {
    const logEntries = parkingDB_getUnacknowledgedLookupErrorLog.getUnacknowledgedLookupErrorLog(req.body.batchID, req.body.logIndex);
    if (logEntries.length === 0) {
        return res.json({
            success: false,
            message: "Log entry not found.  It may have already been acknowledged."
        });
    }
    const statusResponse = parkingDB_createParkingTicketStatus.createParkingTicketStatus({
        recordType: "status",
        ticketID: logEntries[0].ticketID,
        statusKey: "ownerLookupError",
        statusField: "",
        statusNote: logEntries[0].errorMessage + " (" + logEntries[0].errorCode + ")"
    }, req.session, false);
    if (!statusResponse.success) {
        return res.json({
            success: false,
            message: "Unable to update the status on the parking ticket.  It may have been resolved."
        });
    }
    const success = parkingDB_acknowledgeLookupErrorLogEntry.acknowledgeLookupErrorLogEntry(req.body.batchID, req.body.logIndex, req.session);
    return res.json({
        success
    });
};
