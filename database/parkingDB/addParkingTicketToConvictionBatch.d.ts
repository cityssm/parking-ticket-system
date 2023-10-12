import type * as expressSession from 'express-session';
export declare function addParkingTicketToConvictionBatch(batchID: number, ticketID: number, requestSession: expressSession.Session): {
    success: boolean;
    message?: string;
};
export declare const addAllParkingTicketsToConvictionBatch: (batchID: number, ticketIDs: number[], requestSession: expressSession.Session) => {
    success: boolean;
    successCount: number;
    message?: string | undefined;
};
export default addParkingTicketToConvictionBatch;
