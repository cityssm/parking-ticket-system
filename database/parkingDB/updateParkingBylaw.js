import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { clearCacheByTableName } from '../../helpers/functions.cache.js';
export default function updateParkingBylaw(requestBody) {
    const database = sqlite(databasePath);
    const info = database
        .prepare(`update ParkingBylaws
        set bylawDescription = ?
        where bylawNumber = ?
        and isActive = 1`)
        .run(requestBody.bylawDescription, requestBody.bylawNumber);
    database.close();
    clearCacheByTableName('ParkingBylaws');
    return {
        success: info.changes > 0
    };
}
