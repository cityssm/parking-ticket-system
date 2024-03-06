import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export default function deleteParkingLocation(locationKey) {
    const database = sqlite(databasePath);
    const info = database
        .prepare(`update ParkingLocations
        set isActive = 0
        where locationKey = ?
        and isActive = 1`)
        .run(locationKey);
    database.close();
    return {
        success: info.changes > 0
    };
}
