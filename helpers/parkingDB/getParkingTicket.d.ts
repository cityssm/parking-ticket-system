import type * as pts from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const getParkingTicket: (ticketID: number, reqSession: expressSession.Session) => pts.ParkingTicket;
export default getParkingTicket;
