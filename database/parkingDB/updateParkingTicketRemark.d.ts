import type { ParkingTicketRemark } from '../../types/recordTypes.js';
export default function updateParkingTicketRemark(requestBody: ParkingTicketRemark, sessionUser: PTSUser): {
    success: boolean;
};
