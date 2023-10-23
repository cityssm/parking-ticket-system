import sqlite from 'better-sqlite3';
import type { ParkingTicketStatusLog } from '../../types/recordTypes.js';
type CreateParkingTicketStatusReturn = {
    success: true;
    statusIndex: number;
} | {
    success: false;
};
export declare const createParkingTicketStatusWithDB: (database: sqlite.Database, requestBodyOrObject: Partial<ParkingTicketStatusLog>, sessionUser: PTSUser, resolveTicket: boolean) => CreateParkingTicketStatusReturn;
export declare const createParkingTicketStatus: (requestBodyOrObject: Partial<ParkingTicketStatusLog>, sessionUser: PTSUser, resolveTicket: boolean) => CreateParkingTicketStatusReturn;
export default createParkingTicketStatus;
