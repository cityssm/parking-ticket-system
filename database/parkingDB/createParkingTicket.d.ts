import type { ParkingTicket } from '../../types/recordTypes.js';
interface CreateParkingTicketReturn {
    success: boolean;
    message?: string;
    ticketId?: number;
    nextTicketNumber?: string;
}
export default function createParkingTicket(requestBody: ParkingTicket, sessionUser: PTSUser): CreateParkingTicketReturn;
export {};
