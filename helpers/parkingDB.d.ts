/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
import * as sqlite from "better-sqlite3";
import type * as pts from "./ptsTypes";
export declare const dbPath = "data/parking.db";
export declare const canUpdateObject: (obj: pts.Record, reqSession: Express.Session) => boolean;
export declare const getParkingLocationWithDB: (db: sqlite.Database, locationKey: string) => pts.ParkingLocation;
export declare const getLicencePlateOwnerWithDB: (db: sqlite.Database, licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, recordDateOrBefore: number) => pts.LicencePlateOwner;
export declare const getParkingTicketsByLicencePlate: (licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, reqSession: Express.Session) => pts.ParkingTicket[];
export declare const getParkingTicketID: (ticketNumber: string) => number;
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
    statusIndex: number;
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
export declare const getDistinctLicencePlateOwnerVehicleNCICs: (cutoffDate: number) => {
    vehicleNCIC: string;
    recordDateMax: number;
}[];
