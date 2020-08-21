"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParkingOffencesByLocationKey = exports.getParkingOffences = void 0;
const sqlite = require("better-sqlite3");
const parkingDB_1 = require("../parkingDB");
exports.getParkingOffences = () => {
    const db = sqlite(parkingDB_1.dbPath, {
        readonly: true
    });
    const rows = db.prepare("select o.bylawNumber, o.locationKey, o.parkingOffence," +
        " o.offenceAmount, o.discountOffenceAmount, o.discountDays, o.accountNumber" +
        " from ParkingOffences o" +
        " left join ParkingLocations l on o.locationKey = l.locationKey" +
        " where o.isActive = 1 and l.isActive" +
        " and o.bylawNumber in (select b.bylawNumber from ParkingBylaws b where b.isActive = 1)" +
        " order by o.bylawNumber, l.locationName")
        .all();
    db.close();
    return rows;
};
exports.getParkingOffencesByLocationKey = (locationKey) => {
    const db = sqlite(parkingDB_1.dbPath, {
        readonly: true
    });
    const rows = db.prepare("select o.bylawNumber, b.bylawDescription," +
        " o.parkingOffence, o.offenceAmount, o.discountOffenceAmount, o.discountDays" +
        " from ParkingOffences o" +
        " left join ParkingBylaws b on o.bylawNumber = b.bylawNumber" +
        " where o.isActive = 1 and b.isActive = 1" +
        " and o.locationKey = ?" +
        " order by b.orderNumber, b.bylawNumber")
        .all(locationKey);
    db.close();
    return rows;
};
