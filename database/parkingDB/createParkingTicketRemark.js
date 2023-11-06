import * as dateTimeFns from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { getNextParkingTicketRemarkIndex } from './getNextParkingTicketRemarkIndex.js';
export const createParkingTicketRemark = (requestBody, sessionUser) => {
    const database = sqlite(databasePath);
    const remarkIndexNew = getNextParkingTicketRemarkIndex(requestBody.ticketID, database);
    const rightNow = new Date();
    const info = database
        .prepare(`insert into ParkingTicketRemarks (
        ticketID, remarkIndex,
        remarkDate, remarkTime,
        remark,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(requestBody.ticketID, remarkIndexNew, dateTimeFns.dateToInteger(rightNow), dateTimeFns.dateToTimeInteger(rightNow), requestBody.remark, sessionUser.userName, rightNow.getTime(), sessionUser.userName, rightNow.getTime());
    database.close();
    return {
        success: info.changes > 0
    };
};
export default createParkingTicketRemark;
