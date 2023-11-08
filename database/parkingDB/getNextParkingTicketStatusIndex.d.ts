import type sqlite from 'better-sqlite3';
export declare const getNextParkingTicketStatusIndex: (ticketId: number | string, database: sqlite.Database) => number;
export default getNextParkingTicketStatusIndex;
