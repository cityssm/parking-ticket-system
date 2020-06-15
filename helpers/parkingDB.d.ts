/// <reference types="express-session" />
/// <reference types="integer" />
export declare const dbPath = "data/parking.db";
import type * as pts from "./ptsTypes";
export interface GetParkingTicketsQueryOptions {
    isResolved?: boolean;
    ticketNumber?: string;
    licencePlateNumber?: string;
    location?: string;
    limit: number;
    offset: number;
}
export declare function getParkingTickets(reqSession: Express.Session, queryOptions: GetParkingTicketsQueryOptions): {
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
export declare function restoreParkingTicket(ticketID: number, reqSession: Express.Session): {
    success: boolean;
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
export interface GetLicencePlatesQueryOptions {
    licencePlateNumber?: string;
    hasOwnerRecord?: boolean;
    hasUnresolvedTickets?: boolean;
    limit: number;
    offset: number;
}
export declare function getLicencePlates(queryOptions: GetLicencePlatesQueryOptions): {
    count: any;
    licencePlates: any[];
};
export declare function getLicencePlateOwner(licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, recordDateOrBefore: number): pts.LicencePlateOwner;
export declare function getAllLicencePlateOwners(licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string): pts.LicencePlateOwner[];
export declare function getDistinctLicencePlateOwnerVehicleNCICs(cutoffDate: number): any[];
export declare function getParkingLocations(): pts.ParkingLocation[];
interface AddUpdateParkingLocationReturn {
    success: boolean;
    message?: string;
    locations?: pts.ParkingLocation[];
}
export declare function addParkingLocation(reqBody: pts.ParkingLocation): AddUpdateParkingLocationReturn;
export declare function updateParkingLocation(reqBody: pts.ParkingLocation): AddUpdateParkingLocationReturn;
export declare function deleteParkingLocation(locationKey: string): AddUpdateParkingLocationReturn;
export declare function getParkingBylaws(): pts.ParkingBylaw[];
export declare function getParkingBylawsWithOffenceStats(): pts.ParkingBylaw[];
interface AddUpdateParkingBylawReturn {
    success: boolean;
    message?: string;
    bylaws?: pts.ParkingBylaw[];
}
export declare function addParkingBylaw(reqBody: pts.ParkingBylaw): AddUpdateParkingBylawReturn;
export declare function updateParkingBylaw(reqBody: pts.ParkingBylaw): AddUpdateParkingBylawReturn;
export declare function deleteParkingBylaw(bylawNumber: string): AddUpdateParkingBylawReturn;
export declare function updateParkingOffencesByBylawNumber(reqBody: any): AddUpdateParkingBylawReturn;
export declare function getParkingOffences(): pts.ParkingOffence[];
export declare function getParkingOffencesByLocationKey(locationKey: string): pts.ParkingOffence[];
interface AddUpdateParkingOffenceReturn {
    success: boolean;
    message?: string;
    offences?: pts.ParkingOffence[];
}
export declare function addParkingOffence(reqBody: pts.ParkingOffence): AddUpdateParkingOffenceReturn;
export declare function updateParkingOffence(reqBody: pts.ParkingOffence): AddUpdateParkingOffenceReturn;
export declare function deleteParkingOffence(bylawNumber: string, locationKey: string): AddUpdateParkingOffenceReturn;
export {};
