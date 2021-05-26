import sqlite from "better-sqlite3";
import type * as pts from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getParkingTicketStatusesWithDB: (db: sqlite.Database, ticketID: number, reqSession: expressSession.Session) => pts.ParkingTicketStatusLog[];
export declare const getParkingTicketStatuses: (ticketID: number, reqSession: expressSession.Session) => pts.ParkingTicketStatusLog[];
export default getParkingTicketStatuses;
