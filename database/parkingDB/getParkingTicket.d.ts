import type { ParkingTicket } from '../../types/recordTypes.js';
export declare function getParkingTicket(ticketId: number, sessionUser: PTSUser): Promise<ParkingTicket | undefined>;
export default getParkingTicket;
