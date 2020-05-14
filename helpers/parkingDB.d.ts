/// <reference types="express-session" />
/// <reference types="integer" />
export declare const dbPath = "data/parking.db";
import * as pts from "./ptsTypes";
import { RawRowsColumnsReturn } from "@cityssm/expressjs-server-js/types";
export declare function getRawRowsColumns(sql: string, params: any[]): RawRowsColumnsReturn;
export declare type getParkingTickets_queryOptions = {
    isResolved?: boolean;
    ticketNumber?: string;
    licencePlateNumber?: string;
    location?: string;
    limit: number;
    offset: number;
};
export declare function getParkingTickets(reqSession: Express.Session, queryOptions: getParkingTickets_queryOptions): {
    count: any;
    tickets: pts.ParkingTicket[];
};
export declare function getParkingTicketsByLicencePlate(licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, reqSession: Express.Session): pts.ParkingTicket[];
export declare function getParkingTicket(ticketID: number, reqSession: Express.Session): pts.ParkingTicket;
export declare function getParkingTicketID(ticketNumber: string): any;
export declare function createParkingTicket(reqBody: pts.ParkingTicket, reqSession: Express.Session): {
    success: boolean;
    message: string;
    ticketID?: undefined;
    nextTicketNumber?: undefined;
} | {
    success: boolean;
    ticketID: import("integer").IntLike;
    nextTicketNumber: string;
    message?: undefined;
};
export declare function updateParkingTicket(reqBody: pts.ParkingTicket, reqSession: Express.Session): {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
export declare function deleteParkingTicket(ticketID: number, reqSession: Express.Session): {
    success: boolean;
};
export declare function resolveParkingTicket(ticketID: number, reqSession: Express.Session): {
    success: boolean;
};
export declare function unresolveParkingTicket(ticketID: number, reqSession: Express.Session): {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
export declare function getRecentParkingTicketVehicleMakeModelValues(): any[];
export declare function getParkingTicketRemarks(ticketID: number, reqSession: Express.Session): pts.ParkingTicketRemark[];
export declare function createParkingTicketRemark(reqBody: pts.ParkingTicketRemark, reqSession: Express.Session): {
    success: boolean;
};
export declare function updateParkingTicketRemark(reqBody: pts.ParkingTicketRemark, reqSession: Express.Session): {
    success: boolean;
};
export declare function deleteParkingTicketRemark(ticketID: number, remarkIndex: number, reqSession: Express.Session): {
    success: boolean;
};
export declare function getParkingTicketStatuses(ticketID: number, reqSession: Express.Session): any[];
export declare function createParkingTicketStatus(reqBodyOrObj: pts.ParkingTicketStatusLog, reqSession: Express.Session, resolveTicket: boolean): {
    success: boolean;
    statusIndex: any;
};
export declare function updateParkingTicketStatus(reqBody: pts.ParkingTicketStatusLog, reqSession: Express.Session): {
    success: boolean;
};
export declare function deleteParkingTicketStatus(ticketID: number, statusIndex: number, reqSession: Express.Session): {
    success: boolean;
};
export declare type getLicencePlates_queryOptions = {
    licencePlateNumber?: string;
    hasOwnerRecord?: boolean;
    hasUnresolvedTickets?: boolean;
    limit: number;
    offset: number;
};
export declare function getLicencePlates(queryOptions: getLicencePlates_queryOptions): {
    count: any;
    licencePlates: any[];
};
export declare function getLicencePlateOwner(licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, recordDateOrBefore: number): pts.LicencePlateOwner;
export declare function getAllLicencePlateOwners(licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string): pts.LicencePlateOwner[];
export declare function getDistinctLicencePlateOwnerVehicleNCICs(cutoffDate: number): any[];
export declare function getParkingLocations(): pts.ParkingLocation[];
declare type addUpdateParkingLocation_return = {
    success: boolean;
    message?: string;
    locations?: pts.ParkingLocation[];
};
export declare function addParkingLocation(reqBody: pts.ParkingLocation): addUpdateParkingLocation_return;
export declare function updateParkingLocation(reqBody: pts.ParkingLocation): addUpdateParkingLocation_return;
export declare function deleteParkingLocation(locationKey: string): addUpdateParkingLocation_return;
export declare function getParkingBylaws(): pts.ParkingBylaw[];
declare type addUpdateParkingBylaw_return = {
    success: boolean;
    message?: string;
    bylaws?: pts.ParkingBylaw[];
};
export declare function addParkingBylaw(reqBody: pts.ParkingBylaw): addUpdateParkingBylaw_return;
export declare function updateParkingBylaw(reqBody: pts.ParkingBylaw): addUpdateParkingBylaw_return;
export declare function deleteParkingBylaw(bylawNumber: string): addUpdateParkingBylaw_return;
export declare function getParkingOffences(): pts.ParkingOffence[];
export declare function getParkingOffencesByLocationKey(locationKey: string): pts.ParkingOffence[];
declare type addUpdateParkingOffence_return = {
    success: boolean;
    message?: string;
    offences?: pts.ParkingOffence[];
};
export declare function addParkingOffence(reqBody: pts.ParkingOffence): addUpdateParkingOffence_return;
export declare function updateParkingOffence(reqBody: pts.ParkingOffence): addUpdateParkingOffence_return;
export declare function deleteParkingOffence(bylawNumber: string, locationKey: string): addUpdateParkingOffence_return;
export declare function getLicencePlateLookupBatch(batchID_or_negOne: number): pts.LicencePlateLookupBatch;
declare type addLicencePlateToLookupBatch_return = {
    success: boolean;
    message?: string;
    batch?: pts.LicencePlateLookupBatch;
};
export declare function addLicencePlateToLookupBatch(reqBody: pts.LicencePlateLookupBatchEntry, reqSession: Express.Session): addLicencePlateToLookupBatch_return;
declare type addAllLicencePlatesToLookupBatch_body = {
    batchID: number;
    licencePlateCountry: string;
    licencePlateProvince: string;
    licencePlateNumbers: [string, number][];
};
export declare function addAllLicencePlatesToLookupBatch(reqBody: addAllLicencePlatesToLookupBatch_body, reqSession: Express.Session): {
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
declare type lookupBatch_return = {
    success: boolean;
    message?: string;
    batch?: pts.LicencePlateLookupBatch;
};
export declare function clearLookupBatch(batchID: number, reqSession: Express.Session): lookupBatch_return;
export declare function lockLookupBatch(batchID: number, reqSession: Express.Session): lookupBatch_return;
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
export {};
