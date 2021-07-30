import type * as expressSession from "express-session";
export declare const deleteParkingTicketRemark: (ticketID: number, remarkIndex: number, requestSession: expressSession.Session) => {
    success: boolean;
};
export default deleteParkingTicketRemark;
