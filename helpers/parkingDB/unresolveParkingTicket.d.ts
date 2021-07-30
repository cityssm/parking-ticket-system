import type * as expressSession from "express-session";
export declare const unresolveParkingTicket: (ticketID: number, requestSession: expressSession.Session) => {
    success: boolean;
    message?: string;
};
export default unresolveParkingTicket;
