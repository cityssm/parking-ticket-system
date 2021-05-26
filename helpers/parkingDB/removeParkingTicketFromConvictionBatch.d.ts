import type * as expressSession from "express-session";
export declare const removeParkingTicketFromConvictionBatch: (batchID: number, ticketID: number, reqSession: expressSession.Session) => {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
export default removeParkingTicketFromConvictionBatch;
