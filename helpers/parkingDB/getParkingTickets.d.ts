/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
import type * as pts from "../ptsTypes";
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
