import type * as expressSession from "express-session";
export declare const addParkingTicketToConvictionBatch: (batchID: number, ticketID: number, reqSession: expressSession.Session) => {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
export declare const addAllParkingTicketsToConvictionBatch: (batchID: number, ticketIDs: number[], reqSession: expressSession.Session) => {
    success: boolean;
    successCount: number;
    message: string;
} | {
    success: boolean;
    successCount: number;
    message?: undefined;
};
export default addParkingTicketToConvictionBatch;
