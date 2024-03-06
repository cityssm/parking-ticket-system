import type { ParkingTicket } from '../../types/recordTypes.js';
export declare function getLicencePlateExpiryDateFromPieces(requestBody: ParkingTicket): {
    success: boolean;
    message?: string;
    licencePlateExpiryDate?: number;
};
export default function updateParkingTicket(requestBody: ParkingTicket, sessionUser: PTSUser): {
    success: boolean;
    message?: string;
};
