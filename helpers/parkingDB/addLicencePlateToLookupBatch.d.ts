/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
import type * as pts from "../ptsTypes";
interface AddLicencePlateToLookupBatchReturn {
    success: boolean;
    message?: string;
    batch?: pts.LicencePlateLookupBatch;
}
export declare const addLicencePlateToLookupBatch: (reqBody: pts.LicencePlateLookupBatchEntry, reqSession: Express.Session) => AddLicencePlateToLookupBatchReturn;
export {};
