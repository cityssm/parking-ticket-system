import type * as expressSession from "express-session";
export declare const unresolveParkingTicket: (ticketID: number, reqSession: expressSession.Session) => {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
export default unresolveParkingTicket;
