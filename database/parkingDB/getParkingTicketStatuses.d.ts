import sqlite from 'better-sqlite3';
import type { ParkingTicketStatusLog } from '../../types/recordTypes.js';
export default function getParkingTicketStatuses(ticketId: number, sessionUser: PTSUser, connectedDatabase?: sqlite.Database): ParkingTicketStatusLog[];
