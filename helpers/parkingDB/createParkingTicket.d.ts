/// <reference types="integer" />
import type * as pts from "../../types/recordTypes";
import type * as expressSession from "express-session";
export declare const createParkingTicket: (reqBody: pts.ParkingTicket, reqSession: expressSession.Session) => {
    success: boolean;
    message: string;
    ticketID?: undefined;
    nextTicketNumber?: undefined;
} | {
    success: boolean;
    ticketID: import("integer").IntLike;
    nextTicketNumber: string;
    message?: undefined;
};
export default createParkingTicket;
