import sqlite from 'better-sqlite3';
import type { ParkingTicketStatusLog } from '../../types/recordTypes.js';
type CreateParkingTicketStatusReturn = {
    success: true;
    statusIndex: number;
} | {
    success: false;
};
export declare function createParkingTicketStatus(requestBodyOrObject: Partial<ParkingTicketStatusLog>, sessionUser: PTSUser, resolveTicket: boolean, connectedDatabase?: sqlite.Database): CreateParkingTicketStatusReturn;
export default createParkingTicketStatus;
