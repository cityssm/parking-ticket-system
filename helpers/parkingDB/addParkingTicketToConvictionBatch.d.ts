/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
export declare const addParkingTicketToConvictionBatch: (batchID: number, ticketID: number, reqSession: Express.Session) => {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
export declare const addAllParkingTicketsToConvictionBatch: (batchID: number, ticketIDs: number[], reqSession: Express.Session) => {
    success: boolean;
    successCount: number;
    message: string;
} | {
    successCount: number;
    success?: undefined;
    message?: undefined;
};
