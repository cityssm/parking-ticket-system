import sqlite from 'better-sqlite3';
import type * as expressSession from 'express-session';
import type { ParkingTicketStatusLog } from '../../types/recordTypes.js';
type CreateParkingTicketStatusReturn = {
    success: true;
    statusIndex: number;
} | {
    success: false;
};
export declare const createParkingTicketStatusWithDB: (database: sqlite.Database, requestBodyOrObject: ParkingTicketStatusLog, requestSession: expressSession.Session, resolveTicket: boolean) => CreateParkingTicketStatusReturn;
export declare const createParkingTicketStatus: (requestBodyOrObject: ParkingTicketStatusLog, requestSession: expressSession.Session, resolveTicket: boolean) => CreateParkingTicketStatusReturn;
export default createParkingTicketStatus;
