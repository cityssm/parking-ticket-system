/// <reference types="express-session" />
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
