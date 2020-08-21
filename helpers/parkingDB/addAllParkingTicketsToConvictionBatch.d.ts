/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
export declare const addAllParkingTicketsToConvictionBatch: (batchID: number, ticketIDs: number[], reqSession: Express.Session) => {
    successCount: number;
    message: string;
} | {
    successCount: number;
    message?: undefined;
};
