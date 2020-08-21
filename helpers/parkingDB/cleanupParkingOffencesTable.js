"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupParkingOffencesTable = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.cleanupParkingOffencesTable = () => {
    const db = sqlite(databasePaths_1.parkingDB);
    const recordsToDelete = db.prepare("select o.bylawNumber, o.locationKey" +
        " from ParkingOffences o" +
        " where isActive = 0" +
        (" and not exists (" +
            "select 1 from ParkingTickets t where o.bylawNumber = t.bylawNumber and o.locationKey = t.locationKey)"))
        .all();
    for (const record of recordsToDelete) {
        db.prepare("delete from ParkingOffences" +
            " where bylawNumber = ?" +
            " and locationKey = ?" +
            " and isActive = 0")
            .run(record.bylawNumber, record.locationKey);
    }
    db.close();
    return true;
};
