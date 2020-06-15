/// <reference types="express-session" />
/// <reference types="integer" />
import type * as pts from "./ptsTypes";
export declare function getLicencePlateLookupBatch(batchID_or_negOne: number): pts.LicencePlateLookupBatch;
interface AddLicencePlateToLookupBatchReturn {
    success: boolean;
    message?: string;
    batch?: pts.LicencePlateLookupBatch;
}
export declare function addLicencePlateToLookupBatch(reqBody: pts.LicencePlateLookupBatchEntry, reqSession: Express.Session): AddLicencePlateToLookupBatchReturn;
interface AddAllLicencePlatesToLookupBatchBody {
    batchID: number;
    licencePlateCountry: string;
    licencePlateProvince: string;
    licencePlateNumbers: [string, number][];
}
export declare function addAllLicencePlatesToLookupBatch(reqBody: AddAllLicencePlatesToLookupBatchBody, reqSession: Express.Session): {
    success: boolean;
    message: string;
    batch?: undefined;
} | {
    success: boolean;
    batch: pts.LicencePlateLookupBatch;
    message?: undefined;
};
export declare function removeLicencePlateFromLookupBatch(reqBody: pts.LicencePlateLookupBatchEntry, reqSession: Express.Session): {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
interface LookupBatchReturn {
    success: boolean;
    message?: string;
    batch?: pts.LicencePlateLookupBatch;
}
export declare function clearLookupBatch(batchID: number, reqSession: Express.Session): LookupBatchReturn;
export declare function lockLookupBatch(batchID: number, reqSession: Express.Session): LookupBatchReturn;
export declare function markLookupBatchAsSent(batchID: number, reqSession: Express.Session): boolean;
export declare function getUnreceivedLicencePlateLookupBatches(includeUnlocked: boolean): pts.LicencePlateLookupBatch[];
export declare function createLicencePlateLookupBatch(reqSession: Express.Session): {
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
export interface ReconciliationRecord extends pts.LicencePlate {
    ticket_ticketID: number;
    ticket_ticketNumber: string;
    ticket_issueDate: number;
    ticket_issueDateString: string;
    ticket_vehicleMakeModel: string;
    ticket_licencePlateExpiryDate: number;
    ticket_licencePlateExpiryDateString: string;
    owner_recordDate: number;
    owner_recordDateString: string;
    owner_vehicleNCIC: string;
    owner_vehicleMake: string;
    owner_vehicleYear: number;
    owner_vehicleColor: string;
    owner_licencePlateExpiryDate: number;
    owner_licencePlateExpiryDateString: string;
    owner_ownerName1: string;
    owner_ownerName2: string;
    owner_ownerAddress: string;
    owner_ownerCity: string;
    owner_ownerProvince: string;
    owner_ownerPostalCode: string;
    dateDifference: number;
    isVehicleMakeMatch: boolean;
    isLicencePlateExpiryDateMatch: boolean;
}
export declare function getOwnershipReconciliationRecords(): ReconciliationRecord[];
interface LookupErrorLogEntry extends pts.LicencePlate {
    batchID: number;
    logIndex: number;
    recordDate: number;
    recordDateString: string;
    errorCode: string;
    errorMessage: string;
    ticketID: number;
    ticketNumber: string;
    issueDate: number;
    issueDateString: string;
    vehicleMakeModel: string;
}
export declare function getUnacknowledgedLicencePlateLookupErrorLog(batchID_or_negOne: number, logIndex_or_negOne: number): LookupErrorLogEntry[];
export declare function markLicencePlateLookupErrorLogEntryAcknowledged(batchID: number, logIndex: number, reqSession: Express.Session): boolean;
export {};
