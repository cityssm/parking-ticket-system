import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export function addParkingLocation(requestBody) {
    const database = sqlite(databasePath);
    const locationRecord = database
        .prepare('select locationName, isActive' +
        ' from ParkingLocations' +
        ' where locationKey = ?')
        .get(requestBody.locationKey);
    if (locationRecord !== undefined) {
        database.close();
        return {
            success: false,
            message: `The location key "${requestBody.locationKey}" is already associated with the ${locationRecord.isActive ? '' : 'inactive '} record "${locationRecord.locationName}".`
        };
    }
    const info = database
        .prepare('insert into ParkingLocations (' +
        'locationKey, locationName, locationClassKey, orderNumber, isActive)' +
        ' values (?, ?, ?, 0, 1)')
        .run(requestBody.locationKey, requestBody.locationName, requestBody.locationClassKey);
    database.close();
    return {
        success: info.changes > 0
    };
}
export default addParkingLocation;
