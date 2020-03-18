/// <reference types="express-session" />
/// <reference types="integer" />
import * as pts from "./ptsTypes";
export declare function getRawRowsColumns(sql: string, params: any[]): pts.RawRowsColumnsReturn;
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
export declare function createParkingTicketStatus(reqBody: pts.ParkingTicketStatusLog, reqSession: Express.Session, resolveTicket: boolean): {
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
export declare function getLicencePlateOwner(licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string): pts.LicencePlateOwner;
export declare function getDistinctLicencePlateOwnerVehicleNCICs(cutoffDate: number): any[];
export declare function getParkingLocations(): pts.ParkingLocation[];
export declare function getParkingOffences(locationKey: string): pts.ParkingOffence[];
export declare function getParkingTicketsForLookupBatch(includeBatchID: number): void;
