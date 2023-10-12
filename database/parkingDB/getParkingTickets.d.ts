import type * as expressSession from 'express-session';
import type { ParkingTicket } from '../../types/recordTypes.js';
export interface GetParkingTicketsQueryOptions {
    isResolved?: boolean;
    ticketNumber?: string;
    licencePlateNumber?: string;
    licencePlateNumberEqual?: string;
    licencePlateProvince?: string;
    licencePlateCountry?: string;
    location?: string;
    limit: number;
    offset: number;
}
interface GetParkingTicketsReturn {
    count: number;
    limit: number;
    offset: number;
    tickets: ParkingTicket[];
}
export declare const getParkingTickets: (requestSession: expressSession.Session, queryOptions: GetParkingTicketsQueryOptions) => GetParkingTicketsReturn;
export declare const getParkingTicketsByLicencePlate: (licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, requestSession: expressSession.Session) => ParkingTicket[];
export default getParkingTickets;
