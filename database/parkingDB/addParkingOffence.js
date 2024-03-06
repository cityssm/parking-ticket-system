import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
export default function addParkingOffence(requestBody) {
    const database = sqlite(databasePath);
    const existingOffenceRecord = database
        .prepare(`select isActive
        from ParkingOffences
        where bylawNumber = ?
        and locationKey = ?`)
        .get(requestBody.bylawNumber, requestBody.locationKey);
    if (existingOffenceRecord !== undefined) {
        if (existingOffenceRecord.isActive) {
            database.close();
            return {
                success: false,
                message: 'An active offence already exists for the same location and by-law.'
            };
        }
        else {
            const info = database
                .prepare(`update ParkingOffences
            set isActive = 1
            where bylawNumber = ?
            and locationKey = ?`)
                .run(requestBody.bylawNumber, requestBody.locationKey);
            database.close();
            return {
                success: info.changes > 0,
                message: 'A previously deleted offence for the same location and by-law has been restored.'
            };
        }
    }
    let offenceAmount = 0;
    let discountOffenceAmount = 0;
    let discountDays = 0;
    if (Object.hasOwn(requestBody, 'offenceAmount')) {
        offenceAmount = requestBody.offenceAmount;
        discountOffenceAmount = Object.hasOwn(requestBody, 'discountOffenceAmount')
            ? requestBody.discountOffenceAmount
            : requestBody.offenceAmount;
        discountDays = requestBody.discountDays ?? 0;
    }
    else {
        const offenceAmountRecord = database
            .prepare(`select offenceAmount, discountOffenceAmount, discountDays
          from ParkingOffences
          where bylawNumber = ?
          and isActive = 1
          group by offenceAmount, discountOffenceAmount, discountDays
          order by count(locationKey) desc, offenceAmount desc, discountOffenceAmount desc
          limit 1`)
            .get(requestBody.bylawNumber);
        if (offenceAmountRecord !== undefined) {
            offenceAmount = offenceAmountRecord.offenceAmount;
            discountOffenceAmount = offenceAmountRecord.discountOffenceAmount;
            discountDays = offenceAmountRecord.discountDays;
        }
    }
    const info = database
        .prepare(`insert into ParkingOffences (
        bylawNumber, locationKey, parkingOffence,
        offenceAmount, discountOffenceAmount, discountDays,
        accountNumber, isActive)
        values (?, ?, ?, ?, ?, ?, ?, 1)`)
        .run(requestBody.bylawNumber, requestBody.locationKey, requestBody.parkingOffence ?? '', offenceAmount, discountOffenceAmount, discountDays, requestBody.accountNumber ?? '');
    database.close();
    return {
        success: info.changes > 0
    };
}
