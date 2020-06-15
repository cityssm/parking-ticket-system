/// <reference types="express-session" />
/// <reference types="integer" />
import type * as pts from "./ptsTypes";
export declare function createParkingTicketConvictionBatch(reqSession: Express.Session): {
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
export declare function getLastTenParkingTicketConvictionBatches(): pts.ParkingTicketConvictionBatch[];
export declare function getParkingTicketConvictionBatch(batchID_or_negOne: number): pts.ParkingTicketConvictionBatch;
export declare function addParkingTicketToConvictionBatch(batchID: number, ticketID: number, reqSession: Express.Session): {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
export declare function addAllParkingTicketsToConvictionBatch(batchID: number, ticketIDs: number[], reqSession: Express.Session): {
    successCount: number;
    message: string;
} | {
    successCount: number;
    message?: undefined;
};
export declare function removeParkingTicketFromConvictionBatch(batchID: number, ticketID: number, reqSession: Express.Session): {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
export declare function clearConvictionBatch(batchID: number, reqSession: Express.Session): {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
export declare function lockConvictionBatch(batchID: number, reqSession: Express.Session): {
    success: boolean;
    lockDate: number;
    lockDateString: string;
};
export declare function unlockConvictionBatch(batchID: number, reqSession: Express.Session): boolean;
export declare function markConvictionBatchAsSent(batchID: number, reqSession: Express.Session): boolean;
