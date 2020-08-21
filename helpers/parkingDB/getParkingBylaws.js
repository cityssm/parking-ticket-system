"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParkingBylawsWithOffenceStats = exports.getParkingBylaws = void 0;
const sqlite = require("better-sqlite3");
const databasePaths_1 = require("../../data/databasePaths");
exports.getParkingBylaws = () => {
    const db = sqlite(databasePaths_1.parkingDB, {
        readonly: true
    });
    const rows = db.prepare("select bylawNumber, bylawDescription" +
        " from ParkingBylaws" +
        " where isActive = 1" +
        " order by orderNumber, bylawNumber")
        .all();
    db.close();
    return rows;
};
exports.getParkingBylawsWithOffenceStats = () => {
    const db = sqlite(databasePaths_1.parkingDB, {
        readonly: true
    });
    const rows = db.prepare("select b.bylawNumber, b.bylawDescription," +
        " count(o.locationKey) as offenceCount," +
        " min(o.offenceAmount) as offenceAmountMin," +
        " max(o.offenceAmount) as offenceAmountMax," +
        " min(o.discountOffenceAmount) as discountOffenceAmountMin," +
        " max(o.discountOffenceAmount) as discountOffenceAmountMax," +
        " min(o.discountDays) as discountDaysMin," +
        " max(o.discountDays) as discountDaysMax" +
        " from ParkingBylaws b" +
        " left join ParkingOffences o on b.bylawNumber = o.bylawNumber and o.isActive = 1" +
        " where b.isActive = 1" +
        " group by b.bylawNumber, b.bylawDescription, b.orderNumber" +
        " order by b.orderNumber, b.bylawNumber")
        .all();
    db.close();
    return rows;
};
