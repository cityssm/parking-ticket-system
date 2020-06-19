"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupParkingBylawsTable = exports.cleanupParkingLocationsTable = exports.cleanupParkingOffencesTable = exports.cleanupLicencePlateOwnersTable = exports.cleanupParkingTicketStatusLog = exports.cleanupParkingTicketRemarksTable = exports.cleanupParkingTicketsTable = exports.getDatabaseCleanupCounts = void 0;
const parkingDB_1 = require("./parkingDB");
const sqlite = require("better-sqlite3");
const configFns = require("./configFns");
function getDatabaseCleanupCounts() {
    const recordDelete_timeMillisWindow = Date.now() - (configFns.getProperty("databaseCleanup.windowDays") * 86400 * 1000);
    const db = sqlite(parkingDB_1.dbPath, {
        readonly: true
    });
    const parkingTickets = db.prepare("select count(*) as cnt from ParkingTickets t" +
        " where t.recordDelete_timeMillis is not null" +
        " and t.recordDelete_timeMillis < ?" +
        (" and not exists (" +
            "select 1 from LicencePlateLookupBatchEntries b" +
            " where t.ticketID = b.ticketID)"))
        .get(recordDelete_timeMillisWindow).cnt;
    const parkingTicketStatusLog = db.prepare("select count(*) as cnt from ParkingTicketStatusLog" +
        " where recordDelete_timeMillis is not null" +
        " and recordDelete_timeMillis < ?")
        .get(recordDelete_timeMillisWindow).cnt;
    const parkingTicketRemarks = db.prepare("select count(*) as cnt from ParkingTicketRemarks" +
        " where recordDelete_timeMillis is not null" +
        " and recordDelete_timeMillis < ?")
        .get(recordDelete_timeMillisWindow).cnt;
    const licencePlateOwners = db.prepare("select count(*) as cnt from LicencePlateOwners" +
        " where recordDelete_timeMillis is not null" +
        " and recordDelete_timeMillis < ?")
        .get(recordDelete_timeMillisWindow).cnt;
    const parkingLocations = db.prepare("select count(*) as cnt from ParkingLocations l" +
        " where isActive = 0" +
        " and not exists (select 1 from ParkingTickets t where l.locationKey = t.locationKey)" +
        " and not exists (select 1 from ParkingOffences o where l.locationKey = o.locationKey)")
        .get().cnt;
    const parkingBylaws = db.prepare("select count(*) as cnt from ParkingBylaws b" +
        " where isActive = 0" +
        " and not exists (select 1 from ParkingTickets t where b.bylawNumber = t.bylawNumber)" +
        " and not exists (select 1 from ParkingOffences o where b.bylawNumber = o.bylawNumber)")
        .get().cnt;
    const parkingOffences = db.prepare("select count(*) as cnt from ParkingOffences o" +
        " where isActive = 0" +
        " and not exists (select 1 from ParkingTickets t where o.bylawNumber = t.bylawNumber and o.locationKey = t.locationKey)")
        .get().cnt;
    db.close();
    return {
        recordDelete_timeMillis: recordDelete_timeMillisWindow,
        parkingTickets,
        parkingTicketStatusLog,
        parkingTicketRemarks,
        licencePlateOwners,
        parkingLocations,
        parkingBylaws,
        parkingOffences
    };
}
exports.getDatabaseCleanupCounts = getDatabaseCleanupCounts;
function cleanupParkingTicketsTable(recordDelete_timeMillis) {
    const db = sqlite(parkingDB_1.dbPath);
    const recordsToDelete = db.prepare("select ticketID from ParkingTickets t" +
        " where t.recordDelete_timeMillis is not null" +
        " and t.recordDelete_timeMillis < ?" +
        (" and not exists (" +
            "select 1 from LicencePlateLookupBatchEntries b" +
            " where t.ticketID = b.ticketID)"))
        .all(recordDelete_timeMillis);
    recordsToDelete.forEach(function (recordToDelete) {
        db.prepare("delete from ParkingTicketRemarks" +
            " where ticketID = ?")
            .run(recordToDelete.ticketID);
        db.prepare("delete from ParkingTicketStatusLog" +
            " where ticketID = ?")
            .run(recordToDelete.ticketID);
        db.prepare("delete from ParkingTickets" +
            " where ticketID = ?")
            .run(recordToDelete.ticketID);
    });
    db.close();
    return true;
}
exports.cleanupParkingTicketsTable = cleanupParkingTicketsTable;
function cleanupParkingTicketRemarksTable(recordDelete_timeMillis) {
    const db = sqlite(parkingDB_1.dbPath);
    db.prepare("delete from ParkingTicketRemarks" +
        " where recordDelete_timeMillis is not null" +
        " and recordDelete_timeMillis < ?")
        .run(recordDelete_timeMillis);
    db.close();
    return true;
}
exports.cleanupParkingTicketRemarksTable = cleanupParkingTicketRemarksTable;
function cleanupParkingTicketStatusLog(recordDelete_timeMillis) {
    const db = sqlite(parkingDB_1.dbPath);
    db.prepare("delete from ParkingTicketStatusLog" +
        " where recordDelete_timeMillis is not null" +
        " and recordDelete_timeMillis < ?")
        .run(recordDelete_timeMillis);
    db.close();
    return true;
}
exports.cleanupParkingTicketStatusLog = cleanupParkingTicketStatusLog;
function cleanupLicencePlateOwnersTable(recordDelete_timeMillis) {
    const db = sqlite(parkingDB_1.dbPath);
    db.prepare("delete from LicencePlateOwners" +
        " where recordDelete_timeMillis is not null" +
        " and recordDelete_timeMillis < ?")
        .run(recordDelete_timeMillis);
    db.close();
    return true;
}
exports.cleanupLicencePlateOwnersTable = cleanupLicencePlateOwnersTable;
function cleanupParkingOffencesTable() {
    const db = sqlite(parkingDB_1.dbPath);
    const recordsToDelete = db.prepare("select o.bylawNumber, o.locationKey" +
        " from ParkingOffences o" +
        " where isActive = 0" +
        " and not exists (select 1 from ParkingTickets t where o.bylawNumber = t.bylawNumber and o.locationKey = t.locationKey)")
        .all();
    for (const record of recordsToDelete) {
        db.prepare("delete from ParkingOffences" +
            " where bylawNumber = ?" +
            " and locationKey = ?" +
            " and isActive = 0")
            .run(record.bylawNumber, record.locationKey);
    }
    db.close();
    return true;
}
exports.cleanupParkingOffencesTable = cleanupParkingOffencesTable;
function cleanupParkingLocationsTable() {
    const db = sqlite(parkingDB_1.dbPath);
    const recordsToDelete = db.prepare("select locationKey from ParkingLocations l" +
        " where isActive = 0" +
        " and not exists (select 1 from ParkingTickets t where l.locationKey = t.locationKey)" +
        " and not exists (select 1 from ParkingOffences o where l.locationKey = o.locationKey)")
        .all();
    for (const record of recordsToDelete) {
        db.prepare("delete from ParkingLocations" +
            " where locationKey = ?" +
            " and isActive = 0")
            .run(record.locationKey);
    }
    db.close();
    return true;
}
exports.cleanupParkingLocationsTable = cleanupParkingLocationsTable;
function cleanupParkingBylawsTable() {
    const db = sqlite(parkingDB_1.dbPath);
    const recordsToDelete = db.prepare("select bylawNumber from ParkingBylaws b" +
        " where isActive = 0" +
        " and not exists (select 1 from ParkingTickets t where b.bylawNumber = t.bylawNumber)" +
        " and not exists (select 1 from ParkingOffences o where b.bylawNumber = o.bylawNumber)")
        .all();
    for (let recordIndex = 0; recordIndex < recordsToDelete.length; recordIndex += 1) {
        db.prepare("delete from ParkingBylaws" +
            " where bylawNumber = ?" +
            " and isActive = 0")
            .run(recordsToDelete[recordIndex].bylawNumber);
    }
    db.close();
    return true;
}
exports.cleanupParkingBylawsTable = cleanupParkingBylawsTable;
