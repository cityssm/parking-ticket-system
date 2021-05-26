import type * as pts from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const createParkingTicketRemark: (reqBody: pts.ParkingTicketRemark, reqSession: expressSession.Session) => {
    success: boolean;
};
export default createParkingTicketRemark;
