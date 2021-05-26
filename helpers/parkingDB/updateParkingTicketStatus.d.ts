import type * as pts from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const updateParkingTicketStatus: (reqBody: pts.ParkingTicketStatusLog, reqSession: expressSession.Session) => {
    success: boolean;
};
export default updateParkingTicketStatus;
