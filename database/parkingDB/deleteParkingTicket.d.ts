import type * as expressSession from "express-session";
export declare const deleteParkingTicket: (ticketID: number, requestSession: expressSession.Session) => {
    success: boolean;
};
export default deleteParkingTicket;
