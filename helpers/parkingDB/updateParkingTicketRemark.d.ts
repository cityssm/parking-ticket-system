import type * as pts from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const updateParkingTicketRemark: (requestBody: pts.ParkingTicketRemark, requestSession: expressSession.Session) => {
    success: boolean;
};
export default updateParkingTicketRemark;
