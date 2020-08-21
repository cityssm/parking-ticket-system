/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
/// <reference types="integer" />
export declare const createConvictionBatch: (reqSession: Express.Session) => {
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
