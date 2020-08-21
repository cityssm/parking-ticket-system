"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupParkingLocationsTable = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.cleanupParkingLocationsTable = () => {
    const db = sqlite(databasePaths_1.parkingDB);
    const recordsToDelete = db.prepare("select locationKey from ParkingLocations l" +
        " where isActive = 0" +
        " and not exists (select 1 from ParkingTickets t where l.locationKey = t.locationKey)" +
        " and not exists (select 1 from ParkingOffences o where l.locationKey = o.locationKey)")
        .all();
    for (const record of recordsToDelete) {
        db.prepare("delete from ParkingLocations" +
            " where locationKey = ?" +
            " and isActive = 0")
            .run(record.locationKey);
    }
    db.close();
    return true;
};
