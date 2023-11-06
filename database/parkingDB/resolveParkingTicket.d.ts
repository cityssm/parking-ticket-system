import sqlite from 'better-sqlite3';
export declare function resolveParkingTicket(ticketID: number | string, sessionUser: PTSUser, connectedDatabase?: sqlite.Database): {
    success: boolean;
};
export default resolveParkingTicket;
