import type * as sqlite from 'better-sqlite3';
export declare const getNextParkingTicketStatusIndex: (database: sqlite.Database, ticketID: number | string) => number;
export default getNextParkingTicketStatusIndex;
