import type * as pts from "../../types/recordTypes";
import type * as expressSession from "express-session";
interface CreateParkingTicketReturn {
    success: boolean;
    message?: string;
    ticketID?: number;
    nextTicketNumber?: string;
}
export declare const createParkingTicket: (requestBody: pts.ParkingTicket, requestSession: expressSession.Session) => CreateParkingTicketReturn;
export default createParkingTicket;
