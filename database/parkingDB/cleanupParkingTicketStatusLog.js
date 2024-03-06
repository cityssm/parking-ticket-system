import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export default function cleanupParkingTicketStatusLog(recordDelete_timeMillis) {
    const database = sqlite(databasePath);
    database
        .prepare(`delete from ParkingTicketStatusLog
        where recordDelete_timeMillis is not null
        and recordDelete_timeMillis < ?`)
        .run(recordDelete_timeMillis);
    database.close();
    return true;
}
