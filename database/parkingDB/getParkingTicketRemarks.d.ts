import sqlite from 'better-sqlite3';
import type * as expressSession from 'express-session';
import type { ParkingTicketRemark } from '../../types/recordTypes.js';
export declare const getParkingTicketRemarksWithDB: (database: sqlite.Database, ticketID: number, requestSession: expressSession.Session) => ParkingTicketRemark[];
export declare const getParkingTicketRemarks: (ticketID: number, requestSession: expressSession.Session) => ParkingTicketRemark[];
export default getParkingTicketRemarks;
