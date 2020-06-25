/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
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
export declare const getParkingTickets: (reqSession: Express.Session, queryOptions: GetParkingTicketsQueryOptions) => {
    count: any;
    tickets: pts.ParkingTicket[];
};
export declare const getParkingTicketsByLicencePlate: (licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, reqSession: Express.Session) => pts.ParkingTicket[];
export declare const getParkingTicket: (ticketID: number, reqSession: Express.Session) => pts.ParkingTicket;
export declare const getParkingTicketID: (ticketNumber: string) => any;
export declare const createParkingTicket: (reqBody: pts.ParkingTicket, reqSession: Express.Session) => {
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
