import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export const getParkingLocations = () => {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const rows = database
        .prepare(`select locationKey, locationName, locationClassKey
        from ParkingLocations
        where isActive = 1
        order by orderNumber, locationName`)
        .all();
    database.close();
    return rows;
};
export default getParkingLocations;
