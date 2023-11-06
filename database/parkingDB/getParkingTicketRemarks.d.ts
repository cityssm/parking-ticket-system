import sqlite from 'better-sqlite3';
import type { ParkingTicketRemark } from '../../types/recordTypes.js';
export declare function getParkingTicketRemarks(ticketID: number, sessionUser: PTSUser, connectedDatabase?: sqlite.Database): ParkingTicketRemark[];
export default getParkingTicketRemarks;
