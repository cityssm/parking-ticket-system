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
export declare const updateParkingTicket: (reqBody: pts.ParkingTicket, reqSession: Express.Session) => {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
export declare const deleteParkingTicket: (ticketID: number, reqSession: Express.Session) => {
    success: boolean;
};
export declare const resolveParkingTicket: (ticketID: number, reqSession: Express.Session) => {
    success: boolean;
};
export declare const unresolveParkingTicket: (ticketID: number, reqSession: Express.Session) => {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
export declare const restoreParkingTicket: (ticketID: number, reqSession: Express.Session) => {
    success: boolean;
};
export declare const getRecentParkingTicketVehicleMakeModelValues: () => any[];
export declare const getParkingTicketRemarks: (ticketID: number, reqSession: Express.Session) => pts.ParkingTicketRemark[];
export declare const createParkingTicketRemark: (reqBody: pts.ParkingTicketRemark, reqSession: Express.Session) => {
    success: boolean;
};
export declare const updateParkingTicketRemark: (reqBody: pts.ParkingTicketRemark, reqSession: Express.Session) => {
    success: boolean;
};
export declare const deleteParkingTicketRemark: (ticketID: number, remarkIndex: number, reqSession: Express.Session) => {
    success: boolean;
};
export declare const getParkingTicketStatuses: (ticketID: number, reqSession: Express.Session) => any[];
export declare const createParkingTicketStatus: (reqBodyOrObj: pts.ParkingTicketStatusLog, reqSession: Express.Session, resolveTicket: boolean) => {
    success: boolean;
    statusIndex: any;
};
export declare const updateParkingTicketStatus: (reqBody: pts.ParkingTicketStatusLog, reqSession: Express.Session) => {
    success: boolean;
};
export declare const deleteParkingTicketStatus: (ticketID: number, statusIndex: number, reqSession: Express.Session) => {
    success: boolean;
};
export interface GetLicencePlatesQueryOptions {
    licencePlateNumber?: string;
    hasOwnerRecord?: boolean;
    hasUnresolvedTickets?: boolean;
    limit: number;
    offset: number;
}
export declare const getLicencePlates: (queryOptions: GetLicencePlatesQueryOptions) => {
    count: number;
    licencePlates: any[];
};
export declare const getLicencePlateOwner: (licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, recordDateOrBefore: number) => pts.LicencePlateOwner;
export declare const getAllLicencePlateOwners: (licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string) => pts.LicencePlateOwner[];
export declare const getDistinctLicencePlateOwnerVehicleNCICs: (cutoffDate: number) => any[];
