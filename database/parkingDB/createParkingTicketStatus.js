import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { getNextParkingTicketStatusIndex } from './getNextParkingTicketStatusIndex.js';
import { resolveParkingTicketWithDB } from './resolveParkingTicket.js';
export const createParkingTicketStatusWithDB = (database, requestBodyOrObject, requestSession, resolveTicket) => {
    const statusIndexNew = getNextParkingTicketStatusIndex(database, requestBodyOrObject.ticketID);
    const rightNow = new Date();
    const info = database
        .prepare('insert into ParkingTicketStatusLog' +
        ' (ticketID, statusIndex, statusDate, statusTime, statusKey,' +
        ' statusField, statusField2, statusNote,' +
        ' recordCreate_userName, recordCreate_timeMillis, recordUpdate_userName, recordUpdate_timeMillis)' +
        ' values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(requestBodyOrObject.ticketID, statusIndexNew, dateTimeFns.dateToInteger(rightNow), dateTimeFns.dateToTimeInteger(rightNow), requestBodyOrObject.statusKey, requestBodyOrObject.statusField, requestBodyOrObject.statusField2, requestBodyOrObject.statusNote, requestSession.user.userName, rightNow.getTime(), requestSession.user.userName, rightNow.getTime());
    if (info.changes > 0 && resolveTicket) {
        resolveParkingTicketWithDB(database, requestBodyOrObject.ticketID, requestSession);
    }
    return {
        success: true,
        statusIndex: statusIndexNew
    };
};
export const createParkingTicketStatus = (requestBodyOrObject, requestSession, resolveTicket) => {
    const database = sqlite(databasePath);
    const result = createParkingTicketStatusWithDB(database, requestBodyOrObject, requestSession, resolveTicket);
    database.close();
    return result;
};
export default createParkingTicketStatus;
