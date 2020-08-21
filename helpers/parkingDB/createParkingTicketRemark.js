"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createParkingTicketRemark = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const databasePaths_1 = require("../../data/databasePaths");
exports.createParkingTicketRemark = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const remarkIndexNew = db.prepare("select ifnull(max(remarkIndex), 0) as remarkIndexMax" +
        " from ParkingTicketRemarks" +
        " where ticketID = ?")
        .get(reqBody.ticketID)
        .remarkIndexMax + 1;
    const rightNow = new Date();
    const info = db.prepare("insert into ParkingTicketRemarks" +
        " (ticketID, remarkIndex, remarkDate, remarkTime, remark," +
        " recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)" +
        " values (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(reqBody.ticketID, remarkIndexNew, dateTimeFns.dateToInteger(rightNow), dateTimeFns.dateToTimeInteger(rightNow), reqBody.remark, reqSession.user.userName, rightNow.getTime(), reqSession.user.userName, rightNow.getTime());
    db.close();
    return {
        success: (info.changes > 0)
    };
};
