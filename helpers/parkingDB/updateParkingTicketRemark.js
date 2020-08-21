"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateParkingTicketRemark = void 0;
const sqlite = require("better-sqlite3");
const dateTimeFns = require("@cityssm/expressjs-server-js/dateTimeFns");
const databasePaths_1 = require("../../data/databasePaths");
exports.updateParkingTicketRemark = (reqBody, reqSession) => {
    const db = sqlite(databasePaths_1.parkingDB);
    const info = db.prepare("update ParkingTicketRemarks" +
        " set remarkDate = ?," +
        " remarkTime = ?," +
        " remark = ?," +
        " recordUpdate_userName = ?," +
        " recordUpdate_timeMillis = ?" +
        " where ticketID = ?" +
        " and remarkIndex = ?" +
        " and recordDelete_timeMillis is null")
        .run(dateTimeFns.dateStringToInteger(reqBody.remarkDateString), dateTimeFns.timeStringToInteger(reqBody.remarkTimeString), reqBody.remark, reqSession.user.userName, Date.now(), reqBody.ticketID, reqBody.remarkIndex);
    db.close();
    return {
        success: (info.changes > 0)
    };
};
