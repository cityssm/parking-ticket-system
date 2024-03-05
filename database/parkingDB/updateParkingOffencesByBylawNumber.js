import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export function updateParkingOffencesByBylawNumber(requestBody) {
    const database = sqlite(databasePath);
    const info = database
        .prepare(`update ParkingOffences
        set offenceAmount = ?,
        discountOffenceAmount = ?,
        discountDays = ?
        where bylawNumber = ?
        and isActive = 1`)
        .run(requestBody.offenceAmount, requestBody.discountOffenceAmount, requestBody.discountDays, requestBody.bylawNumber);
    database.close();
    return {
        success: info.changes > 0
    };
}
export default updateParkingOffencesByBylawNumber;
