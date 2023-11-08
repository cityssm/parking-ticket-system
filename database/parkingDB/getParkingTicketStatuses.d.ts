import sqlite from 'better-sqlite3';
import type { ParkingTicketStatusLog } from '../../types/recordTypes.js';
export declare const getParkingTicketStatuses: (ticketId: number, sessionUser: PTSUser, connectedDatabase?: sqlite.Database) => ParkingTicketStatusLog[];
export default getParkingTicketStatuses;
