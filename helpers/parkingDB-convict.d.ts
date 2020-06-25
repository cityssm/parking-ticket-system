/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
/// <reference types="integer" />
import type * as pts from "./ptsTypes";
export declare const createParkingTicketConvictionBatch: (reqSession: Express.Session) => {
    success: boolean;
    batch: {
        batchID: import("integer").IntLike;
        batchDate: number;
        batchDateString: string;
        lockDate: any;
        lockDateString: string;
        batchEntries: any[];
    };
} | {
    success: boolean;
    batch?: undefined;
};
export declare const getLastTenParkingTicketConvictionBatches: () => pts.ParkingTicketConvictionBatch[];
export declare const getParkingTicketConvictionBatch: (batchID_or_negOne: number) => pts.ParkingTicketConvictionBatch;
export declare const addParkingTicketToConvictionBatch: (batchID: number, ticketID: number, reqSession: Express.Session) => {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
export declare const addAllParkingTicketsToConvictionBatch: (batchID: number, ticketIDs: number[], reqSession: Express.Session) => {
    successCount: number;
    message: string;
} | {
    successCount: number;
    message?: undefined;
};
export declare const removeParkingTicketFromConvictionBatch: (batchID: number, ticketID: number, reqSession: Express.Session) => {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
export declare const clearConvictionBatch: (batchID: number, reqSession: Express.Session) => {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
export declare const lockConvictionBatch: (batchID: number, reqSession: Express.Session) => {
    success: boolean;
    lockDate: number;
    lockDateString: string;
};
export declare const unlockConvictionBatch: (batchID: number, reqSession: Express.Session) => boolean;
export declare const markConvictionBatchAsSent: (batchID: number, reqSession: Express.Session) => boolean;
