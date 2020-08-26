/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
import type * as pts from "../../types/recordTypes";
export declare const createParkingTicketRemark: (reqBody: pts.ParkingTicketRemark, reqSession: Express.Session) => {
    success: boolean;
};
