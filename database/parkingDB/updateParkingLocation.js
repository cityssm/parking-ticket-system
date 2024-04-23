import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { clearCacheByTableName } from '../../helpers/functions.cache.js';
export default function updateParkingLocation(requestBody) {
    const database = sqlite(databasePath);
    const info = database
        .prepare(`update ParkingLocations
        set locationName = ?,
        locationClassKey = ?
        where locationKey = ?
        and isActive = 1`)
        .run(requestBody.locationName, requestBody.locationClassKey, requestBody.locationKey);
    database.close();
    clearCacheByTableName('ParkingLocations');
    return {
        success: info.changes > 0
    };
}
