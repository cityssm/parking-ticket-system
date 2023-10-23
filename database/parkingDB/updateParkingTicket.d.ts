import type { ParkingTicket } from '../../types/recordTypes.js';
export declare const getLicencePlateExpiryDateFromPieces: (requestBody: ParkingTicket) => {
    success: boolean;
    message?: string | undefined;
    licencePlateExpiryDate?: number | undefined;
};
export declare const updateParkingTicket: (requestBody: ParkingTicket, sessionUser: PTSUser) => {
    success: boolean;
    message?: string;
};
export default updateParkingTicket;
