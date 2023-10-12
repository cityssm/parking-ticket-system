import type * as expressSession from 'express-session';
import type { ParkingTicket } from '../../types/recordTypes.js';
export declare const getParkingTicket: (ticketID: number, requestSession: expressSession.Session) => ParkingTicket | undefined;
export default getParkingTicket;
