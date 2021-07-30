import type * as pts from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const createParkingTicketRemark: (requestBody: pts.ParkingTicketRemark, requestSession: expressSession.Session) => {
    success: boolean;
};
export default createParkingTicketRemark;
