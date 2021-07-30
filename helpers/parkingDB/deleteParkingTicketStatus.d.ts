import type * as expressSession from "express-session";
export declare const deleteParkingTicketStatus: (ticketID: number, statusIndex: number, requestSession: expressSession.Session) => {
    success: boolean;
};
export default deleteParkingTicketStatus;
