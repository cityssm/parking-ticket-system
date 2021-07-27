import sqlite from "better-sqlite3";
import * as configFunctions from "../functions.config.js";
import { parkingDB as dbPath } from "../../data/databasePaths.js";
export const getDatabaseCleanupCounts = () => {
    const recordDelete_timeMillisWindow = Date.now() - (configFunctions.getProperty("databaseCleanup.windowDays") * 86400 * 1000);
    const db = sqlite(dbPath, {
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
        (" and not exists (" +
            "select 1 from ParkingTickets t where o.bylawNumber = t.bylawNumber and o.locationKey = t.locationKey)"))
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
};
export default getDatabaseCleanupCounts;
