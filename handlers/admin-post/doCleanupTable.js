"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const configFns = require("../../helpers/configFns");
const parkingDB_cleanupParkingTicketsTable = require("../../helpers/parkingDB/cleanupParkingTicketsTable");
const parkingDB_cleanupParkingTicketRemarksTable = require("../../helpers/parkingDB/cleanupParkingTicketRemarksTable");
const parkingDB_cleanupParkingTicketStatusLog = require("../../helpers/parkingDB/cleanupParkingTicketStatusLog");
const parkingDB_cleanupParkingBylawsTable = require("../../helpers/parkingDB/cleanupParkingBylawsTable");
const parkingDB_cleanupParkingLocationsTable = require("../../helpers/parkingDB/cleanupParkingLocationsTable");
const parkingDB_cleanupParkingOffencesTable = require("../../helpers/parkingDB/cleanupParkingOffencesTable");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!userFns_1.userIsAdmin(req)) {
        return userFns_1.forbiddenJSON(res);
    }
    const table = req.body.table;
    const recordDelete_timeMillis = Math.min(parseInt(req.body.recordDelete_timeMillis, 10), Date.now() - (configFns.getProperty("databaseCleanup.windowDays") * 86400 * 1000));
    let success = false;
    switch (table) {
        case "parkingTickets":
            success = parkingDB_cleanupParkingTicketsTable.cleanupParkingTicketsTable(recordDelete_timeMillis);
            break;
        case "parkingTicketRemarks":
            success = parkingDB_cleanupParkingTicketRemarksTable.cleanupParkingTicketRemarksTable(recordDelete_timeMillis);
            break;
        case "parkingTicketStatusLog":
            success = parkingDB_cleanupParkingTicketStatusLog.cleanupParkingTicketStatusLog(recordDelete_timeMillis);
            break;
        case "licencePlateOwners":
            success = parkingDB_cleanupLicencePlateOwnersTable.cleanupLicencePlateOwnersTable(recordDelete_timeMillis);
            break;
        case "parkingOffences":
            success = parkingDB_cleanupParkingOffencesTable.cleanupParkingOffencesTable();
            break;
        case "parkingLocations":
            success = parkingDB_cleanupParkingLocationsTable.cleanupParkingLocationsTable();
            break;
        case "parkingBylaws":
            success = parkingDB_cleanupParkingBylawsTable.cleanupParkingBylawsTable();
            break;
    }
    return res.json({ success });
};
