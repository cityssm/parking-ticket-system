/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
interface AddAllLicencePlatesToLookupBatchBody {
    batchID: number;
    licencePlateCountry: string;
    licencePlateProvince: string;
    licencePlateNumbers: Array<[string, number]>;
}
export declare const addAllLicencePlatesToLookupBatch: (reqBody: AddAllLicencePlatesToLookupBatchBody, reqSession: Express.Session) => {
    success: boolean;
    message: string;
    batch?: undefined;
} | {
    success: boolean;
    batch: import("../ptsTypes").LicencePlateLookupBatch;
    message?: undefined;
};
export {};
