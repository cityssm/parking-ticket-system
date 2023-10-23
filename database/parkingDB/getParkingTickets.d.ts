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
export declare const getParkingTickets: (sessionUser: PTSUser, queryOptions: GetParkingTicketsQueryOptions) => GetParkingTicketsReturn;
export declare const getParkingTicketsByLicencePlate: (licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, sessionUser: PTSUser) => ParkingTicket[];
export default getParkingTickets;
