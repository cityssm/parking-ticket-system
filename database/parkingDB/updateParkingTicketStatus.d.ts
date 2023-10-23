import type { ParkingTicketStatusLog } from '../../types/recordTypes.js';
export declare const updateParkingTicketStatus: (requestBody: ParkingTicketStatusLog, sessionUser: PTSUser) => {
    success: boolean;
};
export default updateParkingTicketStatus;
