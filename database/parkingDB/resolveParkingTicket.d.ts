import sqlite from 'better-sqlite3';
export declare function resolveParkingTicketWithDB(database: sqlite.Database, ticketID: number | string, sessionUser: PTSUser): {
    success: boolean;
};
export declare function resolveParkingTicket(ticketID: number, sessionUser: PTSUser): {
    success: boolean;
};
export default resolveParkingTicket;
