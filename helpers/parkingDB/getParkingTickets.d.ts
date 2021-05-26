import type * as pts from "../../types/recordTypes";
import type * as expressSession from "express-session";
export interface GetParkingTicketsQueryOptions {
    isResolved?: boolean;
    ticketNumber?: string;
    licencePlateNumber?: string;
    licencePlateNumberEqual?: string;
    licencePlateProvince?: string;
    licencePlateCountry?: string;
    location?: string;
    limit?: number;
    offset?: number;
}
export declare const getParkingTickets: (reqSession: expressSession.Session, queryOptions: GetParkingTicketsQueryOptions) => {
    count: any;
    limit: number;
    offset: number;
    tickets: pts.ParkingTicket[];
};
export declare const getParkingTicketsByLicencePlate: (licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, reqSession: expressSession.Session) => pts.ParkingTicket[];
export default getParkingTickets;
