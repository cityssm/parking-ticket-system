import sqlite from "better-sqlite3";
import type * as expressSession from "express-session";
export declare const resolveParkingTicketWithDB: (db: sqlite.Database, ticketID: number, reqSession: expressSession.Session) => {
    success: boolean;
};
export declare const resolveParkingTicket: (ticketID: number, reqSession: expressSession.Session) => {
    success: {
        success: boolean;
    };
};
export default resolveParkingTicket;
