import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { getConfigProperty } from '../../helpers/functions.config.js';
export function getDatabaseCleanupCounts() {
    const recordDelete_timeMillisWindow = Date.now() - getConfigProperty('databaseCleanup.windowDays') * 86400 * 1000;
    const database = sqlite(databasePath, {
        readonly: true
    });
    const parkingTickets = database
        .prepare(`select count(*) as cnt
          from ParkingTickets t
          where t.recordDelete_timeMillis is not null
          and t.recordDelete_timeMillis < ?
          and not exists (select 1 from LicencePlateLookupBatchEntries b where t.ticketID = b.ticketID)`)
        .pluck()
        .get(recordDelete_timeMillisWindow);
    const parkingTicketStatusLog = database
        .prepare(`select count(*) as cnt
        from ParkingTicketStatusLog
        where recordDelete_timeMillis is not null
        and recordDelete_timeMillis < ?`)
        .pluck()
        .get(recordDelete_timeMillisWindow);
    const parkingTicketRemarks = database
        .prepare(`select count(*) as cnt
        from ParkingTicketRemarks
        where recordDelete_timeMillis is not null
        and recordDelete_timeMillis < ?`)
        .pluck()
        .get(recordDelete_timeMillisWindow);
    const licencePlateOwners = database
        .prepare(`select count(*) as cnt
        from LicencePlateOwners
        where recordDelete_timeMillis is not null
        and recordDelete_timeMillis < ?`)
        .pluck()
        .get(recordDelete_timeMillisWindow);
    const parkingLocations = database
        .prepare(`select count(*) as cnt
        from ParkingLocations l
        where isActive = 0
        and not exists (select 1 from ParkingTickets t where l.locationKey = t.locationKey)
        and not exists (select 1 from ParkingOffences o where l.locationKey = o.locationKey)`)
        .pluck()
        .get();
    const parkingBylaws = database
        .prepare(`select count(*) as cnt
        from ParkingBylaws b
        where isActive = 0
        and not exists (select 1 from ParkingTickets t where b.bylawNumber = t.bylawNumber)
        and not exists (select 1 from ParkingOffences o where b.bylawNumber = o.bylawNumber)`)
        .pluck()
        .get();
    const parkingOffences = database
        .prepare(`select count(*) as cnt
        from ParkingOffences o
        where isActive = 0
        and not exists (select 1 from ParkingTickets t where o.bylawNumber = t.bylawNumber and o.locationKey = t.locationKey)`)
        .pluck()
        .get();
    database.close();
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
export default getDatabaseCleanupCounts;
