import type * as sqlite from 'better-sqlite3';
export declare const getNextParkingTicketStatusIndex: (ticketID: number | string, database: sqlite.Database) => number;
export default getNextParkingTicketStatusIndex;
