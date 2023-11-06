import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export function deleteParkingOffence(bylawNumber, locationKey) {
    const database = sqlite(databasePath);
    const info = database
        .prepare(`update ParkingOffences
        set isActive = 0
        where bylawNumber = ?
        and locationKey = ?
        and isActive = 1`)
        .run(bylawNumber, locationKey);
    database.close();
    return {
        success: info.changes > 0
    };
}
export default deleteParkingOffence;
