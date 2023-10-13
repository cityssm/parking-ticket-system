import type * as expressSession from 'express-session';
export declare const removeParkingTicketFromConvictionBatch: (batchID: number, ticketID: number, requestSession: expressSession.Session) => {
    success: boolean;
    message?: string;
};
export default removeParkingTicketFromConvictionBatch;
