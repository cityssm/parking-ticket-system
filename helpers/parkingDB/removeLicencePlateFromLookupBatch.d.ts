/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
import type * as pts from "../../types/recordTypes";
export declare const removeLicencePlateFromLookupBatch: (reqBody: pts.LicencePlateLookupBatchEntry, reqSession: Express.Session) => {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
