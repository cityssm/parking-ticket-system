import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export const getParkingLocation = (locationKey, connectedDatabase) => {
    const database = connectedDatabase ?? sqlite(databasePath, { readonly: true });
    const location = database
        .prepare(`select locationKey, locationName, locationClassKey, isActive
        from ParkingLocations
        where locationKey = ?`)
        .get(locationKey);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return location;
};
