import type { ParkingTicket } from '../../types/recordTypes.js';
export declare const getParkingTicket: (ticketId: number, sessionUser: PTSUser) => ParkingTicket | undefined;
export default getParkingTicket;
