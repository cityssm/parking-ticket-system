import sqlite from 'better-sqlite3';
import type * as pts from '../../types/recordTypes';
import type * as expressSession from 'express-session';
export declare const getParkingTicketStatusesWithDB: (database: sqlite.Database, ticketID: number, requestSession: expressSession.Session) => pts.ParkingTicketStatusLog[];
export declare const getParkingTicketStatuses: (ticketID: number, requestSession: expressSession.Session) => pts.ParkingTicketStatusLog[];
export default getParkingTicketStatuses;
