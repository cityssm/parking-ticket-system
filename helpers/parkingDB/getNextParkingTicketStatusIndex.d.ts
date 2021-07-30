import type * as sqlite from "better-sqlite3";
export declare const getNextParkingTicketStatusIndex: (database: sqlite.Database, ticketID: number) => number;
export default getNextParkingTicketStatusIndex;
