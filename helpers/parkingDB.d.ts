/// <reference types="express-session" />
/// <reference types="integer" />
import * as pts from "./ptsTypes";
export declare type getParkingTickets_queryOptions = {
    isResolved?: boolean;
    ticketNumber?: string;
    licencePlateNumber?: string;
    location?: string;
    limit: number;
    offset: number;
};
export declare function getParkingTickets(reqSession: Express.SessionData, queryOptions: getParkingTickets_queryOptions): {
    count: any;
    tickets: pts.ParkingTicket[];
};
export declare function getParkingTicket(ticketID: number, reqSession: Express.SessionData): pts.ParkingTicket;
export declare function createParkingTicket(reqBody: pts.ParkingTicket, reqSession: Express.SessionData): {
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
export declare function updateParkingTicket(reqBody: pts.ParkingTicket, reqSession: Express.SessionData): {
    success: boolean;
    message: string;
} | {
    success: boolean;
    message?: undefined;
};
export declare function getRecentParkingTicketVehicleMakeModelValues(): any[];
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
export declare function getParkingLocations(): pts.ParkingLocation[];
export declare function getParkingOffences(locationKey: string): pts.ParkingOffence[];
