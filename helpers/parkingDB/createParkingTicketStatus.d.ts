import sqlite from "better-sqlite3";
import type * as pts from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const createParkingTicketStatusWithDB: (db: sqlite.Database, reqBodyOrObj: pts.ParkingTicketStatusLog, reqSession: expressSession.Session, resolveTicket: boolean) => {
    success: boolean;
    statusIndex: number;
};
export declare const createParkingTicketStatus: (reqBodyOrObj: pts.ParkingTicketStatusLog, reqSession: expressSession.Session, resolveTicket: boolean) => {
    success: boolean;
    statusIndex: number;
};
export default createParkingTicketStatus;
