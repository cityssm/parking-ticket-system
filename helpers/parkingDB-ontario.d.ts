import type { ParkingTicket } from "../types/recordTypes";
interface MTO_AvailableLicencePlate {
    licencePlateNumber: string;
    ticketIDMin: number;
    ticketCount: number;
    issueDateMin: number;
    issueDateMinString: string;
    issueDateMax: number;
    issueDateMaxString: string;
    ticketNumbersConcat: string;
    ticketNumbers: string[];
}
export declare const getLicencePlatesAvailableForMTOLookupBatch: (currentBatchID: number, issueDaysAgo: number) => MTO_AvailableLicencePlate[];
export declare const getParkingTicketsAvailableForMTOConvictionBatch: () => ParkingTicket[];
export {};
