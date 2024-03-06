import type { ParkingTicketStatusLog } from '../../types/recordTypes.js';
export default function updateParkingTicketStatus(requestBody: ParkingTicketStatusLog, sessionUser: PTSUser): {
    success: boolean;
};
