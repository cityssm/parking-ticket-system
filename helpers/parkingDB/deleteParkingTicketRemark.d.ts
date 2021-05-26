import type * as expressSession from "express-session";
export declare const deleteParkingTicketRemark: (ticketID: number, remarkIndex: number, reqSession: expressSession.Session) => {
    success: boolean;
};
export default deleteParkingTicketRemark;
