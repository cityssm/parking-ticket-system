"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupParkingBylawsTable = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.cleanupParkingBylawsTable = () => {
    const db = sqlite(databasePaths_1.parkingDB);
    const recordsToDelete = db.prepare("select bylawNumber from ParkingBylaws b" +
        " where isActive = 0" +
        " and not exists (select 1 from ParkingTickets t where b.bylawNumber = t.bylawNumber)" +
        " and not exists (select 1 from ParkingOffences o where b.bylawNumber = o.bylawNumber)")
        .all();
    for (const recordToDelete of recordsToDelete) {
        db.prepare("delete from ParkingBylaws" +
            " where bylawNumber = ?" +
            " and isActive = 0")
            .run(recordToDelete.bylawNumber);
    }
    db.close();
    return true;
};
