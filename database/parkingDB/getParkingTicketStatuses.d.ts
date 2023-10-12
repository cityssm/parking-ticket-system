import sqlite from 'better-sqlite3';
import type * as expressSession from 'express-session';
import type { ParkingTicketStatusLog } from '../../types/recordTypes.js';
export declare const getParkingTicketStatusesWithDB: (database: sqlite.Database, ticketID: number, requestSession: expressSession.Session) => ParkingTicketStatusLog[];
export declare const getParkingTicketStatuses: (ticketID: number, requestSession: expressSession.Session) => ParkingTicketStatusLog[];
export default getParkingTicketStatuses;
