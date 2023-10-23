import type { ParkingTicket } from '../../types/recordTypes.js';
export declare const getParkingTicket: (ticketID: number, sessionUser: PTSUser) => ParkingTicket | undefined;
export default getParkingTicket;
