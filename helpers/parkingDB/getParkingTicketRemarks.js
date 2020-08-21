"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParkingTicketRemarks = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const parkingDB_1 = require("../parkingDB");
const databasePaths_1 = require("../../data/databasePaths");
exports.getParkingTicketRemarks = (ticketID, reqSession) => {
    const db = sqlite(databasePaths_1.parkingDB, {
        readonly: true
    });
    const remarkRows = db.prepare("select remarkIndex, remarkDate, remarkTime, remark," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis" +
        " from ParkingTicketRemarks" +
        " where recordDelete_timeMillis is null" +
        " and ticketID = ?" +
        " order by remarkDate desc, remarkTime desc, remarkIndex desc")
        .all(ticketID);
    db.close();
    for (const remark of remarkRows) {
        remark.recordType = "remark";
        remark.remarkDateString = dateTimeFns.dateIntegerToString(remark.remarkDate);
        remark.remarkTimeString = dateTimeFns.timeIntegerToString(remark.remarkTime);
        remark.canUpdate = parkingDB_1.canUpdateObject(remark, reqSession);
    }
    return remarkRows;
};
