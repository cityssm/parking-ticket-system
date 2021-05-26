import sqlite from "better-sqlite3";
import type * as pts from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getParkingTicketRemarksWithDB: (db: sqlite.Database, ticketID: number, reqSession: expressSession.Session) => pts.ParkingTicketRemark[];
export declare const getParkingTicketRemarks: (ticketID: number, reqSession: expressSession.Session) => pts.ParkingTicketRemark[];
export default getParkingTicketRemarks;
