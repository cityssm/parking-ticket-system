import type sqlite from 'better-sqlite3';
export default function getNextParkingTicketStatusIndex(ticketId: number | string, database: sqlite.Database): number;
