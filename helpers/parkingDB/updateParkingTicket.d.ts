import type * as pts from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getLicencePlateExpiryDateFromPieces: (requestBody: pts.ParkingTicket) => {
    success: boolean;
    message?: string;
    licencePlateExpiryDate?: number;
};
export declare const updateParkingTicket: (requestBody: pts.ParkingTicket, requestSession: expressSession.Session) => {
    success: boolean;
    message?: string;
};
export default updateParkingTicket;
