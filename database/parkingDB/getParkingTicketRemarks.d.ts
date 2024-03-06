import sqlite from 'better-sqlite3';
import type { ParkingTicketRemark } from '../../types/recordTypes.js';
export default function getParkingTicketRemarks(ticketId: number, sessionUser: PTSUser, connectedDatabase?: sqlite.Database): ParkingTicketRemark[];
