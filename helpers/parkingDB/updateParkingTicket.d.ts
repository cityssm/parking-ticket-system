/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
import type * as pts from "../ptsTypes";
export declare const getLicencePlateExpiryDateFromPieces: (reqBody: pts.ParkingTicket) => {
    success: boolean;
    message: string;
    licencePlateExpiryDate?: undefined;
} | {
    success: boolean;
    licencePlateExpiryDate: number;
    message?: undefined;
};
export declare const updateParkingTicket: (reqBody: pts.ParkingTicket, reqSession: Express.Session) => {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
