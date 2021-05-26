import type * as expressSession from "express-session";
export declare const deleteParkingTicket: (ticketID: number, reqSession: expressSession.Session) => {
    success: boolean;
};
export default deleteParkingTicket;
