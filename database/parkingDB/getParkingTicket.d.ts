import type { ParkingTicket } from '../../types/recordTypes.js';
export default function getParkingTicket(ticketId: number, sessionUser: PTSUser): Promise<ParkingTicket | undefined>;
