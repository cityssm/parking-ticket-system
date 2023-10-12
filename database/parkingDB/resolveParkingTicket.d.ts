import sqlite from 'better-sqlite3';
import type * as expressSession from 'express-session';
export declare function resolveParkingTicketWithDB(database: sqlite.Database, ticketID: number, requestSession: expressSession.Session): {
    success: boolean;
};
export declare function resolveParkingTicket(ticketID: number, requestSession: expressSession.Session): {
    success: boolean;
};
export default resolveParkingTicket;
