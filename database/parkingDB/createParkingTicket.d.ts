import type * as expressSession from 'express-session';
import type { ParkingTicket } from '../../types/recordTypes.js';
interface CreateParkingTicketReturn {
    success: boolean;
    message?: string;
    ticketID?: number;
    nextTicketNumber?: string;
}
export declare function createParkingTicket(requestBody: ParkingTicket, requestSession: expressSession.Session): CreateParkingTicketReturn;
export default createParkingTicket;
