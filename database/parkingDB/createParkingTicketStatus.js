import * as dateTimeFns from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { parkingDB as databasePath } from '../../data/databasePaths.js';
import { getNextParkingTicketStatusIndex } from './getNextParkingTicketStatusIndex.js';
import { resolveParkingTicket } from './resolveParkingTicket.js';
export function createParkingTicketStatus(requestBodyOrObject, sessionUser, resolveTicket, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(databasePath);
    const statusIndexNew = getNextParkingTicketStatusIndex(requestBodyOrObject.ticketId, database);
    const rightNow = new Date();
    const info = database
        .prepare(`insert into ParkingTicketStatusLog (
        ticketId, statusIndex,
        statusDate, statusTime,
        statusKey, statusField, statusField2, statusNote,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(requestBodyOrObject.ticketId, statusIndexNew, dateTimeFns.dateToInteger(rightNow), dateTimeFns.dateToTimeInteger(rightNow), requestBodyOrObject.statusKey, requestBodyOrObject.statusField, requestBodyOrObject.statusField2, requestBodyOrObject.statusNote, sessionUser.userName, rightNow.getTime(), sessionUser.userName, rightNow.getTime());
    if (info.changes > 0 && resolveTicket) {
        resolveParkingTicket(requestBodyOrObject.ticketId, sessionUser, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return {
        success: true,
        statusIndex: statusIndexNew
    };
}
export default createParkingTicketStatus;
