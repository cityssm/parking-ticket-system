import sqlite from "better-sqlite3";
import type * as pts from "../../types/recordTypes";
import type * as expressSession from "express-session";
interface CreateParkingTicketStatusReturn {
    success: boolean;
    statusIndex?: number;
}
export declare const createParkingTicketStatusWithDB: (database: sqlite.Database, requestBodyOrObject: pts.ParkingTicketStatusLog, requestSession: expressSession.Session, resolveTicket: boolean) => CreateParkingTicketStatusReturn;
export declare const createParkingTicketStatus: (requestBodyOrObject: pts.ParkingTicketStatusLog, requestSession: expressSession.Session, resolveTicket: boolean) => CreateParkingTicketStatusReturn;
export default createParkingTicketStatus;
