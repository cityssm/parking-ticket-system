import type * as pts from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getLicencePlateExpiryDateFromPieces: (reqBody: pts.ParkingTicket) => {
    success: boolean;
    message: string;
    licencePlateExpiryDate?: undefined;
} | {
    success: boolean;
    licencePlateExpiryDate: number;
    message?: undefined;
};
export declare const updateParkingTicket: (reqBody: pts.ParkingTicket, reqSession: expressSession.Session) => {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
export default updateParkingTicket;
