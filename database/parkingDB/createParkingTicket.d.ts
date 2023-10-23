import type { ParkingTicket } from '../../types/recordTypes.js';
interface CreateParkingTicketReturn {
    success: boolean;
    message?: string;
    ticketID?: number;
    nextTicketNumber?: string;
}
export declare function createParkingTicket(requestBody: ParkingTicket, sessionUser: PTSUser): CreateParkingTicketReturn;
export default createParkingTicket;
