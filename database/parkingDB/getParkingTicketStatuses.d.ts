import sqlite from 'better-sqlite3';
import type { ParkingTicketStatusLog } from '../../types/recordTypes.js';
export declare const getParkingTicketStatusesWithDB: (database: sqlite.Database, ticketID: number, sessionUser: PTSUser) => ParkingTicketStatusLog[];
export declare const getParkingTicketStatuses: (ticketID: number, sessionUser: PTSUser) => ParkingTicketStatusLog[];
export default getParkingTicketStatuses;
