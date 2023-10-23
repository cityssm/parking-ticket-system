import sqlite from 'better-sqlite3';
import type { ParkingTicketRemark } from '../../types/recordTypes.js';
export declare const getParkingTicketRemarksWithDB: (database: sqlite.Database, ticketID: number, sessionUser: PTSUser) => ParkingTicketRemark[];
export declare const getParkingTicketRemarks: (ticketID: number, sessionUser: PTSUser) => ParkingTicketRemark[];
export default getParkingTicketRemarks;
