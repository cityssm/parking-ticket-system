import sqlite from 'better-sqlite3';
export default function resolveParkingTicket(ticketId: number | string, sessionUser: PTSUser, connectedDatabase?: sqlite.Database): {
    success: boolean;
};
