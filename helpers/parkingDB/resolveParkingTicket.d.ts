import sqlite from "better-sqlite3";
import type * as expressSession from "express-session";
export declare const resolveParkingTicketWithDB: (database: sqlite.Database, ticketID: number, requestSession: expressSession.Session) => {
    success: boolean;
};
export declare const resolveParkingTicket: (ticketID: number, requestSession: expressSession.Session) => {
    success: boolean;
};
export default resolveParkingTicket;
