import sqlite from 'better-sqlite3';
export declare const isParkingTicketConvictedWithDB: (database: sqlite.Database, ticketID: number) => boolean;
export declare const isParkingTicketConvicted: (ticketID: number) => boolean;
export default isParkingTicketConvicted;
