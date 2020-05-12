import { ParkingTicket } from "./ptsTypes";
declare type MTO_AvailableLicencePlate = {
    licencePlateNumber: string;
    ticketCount: number;
    issueDateMin: number;
    issueDateMinString: string;
    issueDateMax: number;
    issueDateMaxString: string;
    ticketNumbersConcat: string;
    ticketNumbers: string[];
};
export declare function getLicencePlatesAvailableForMTOLookupBatch(currentBatchID: number, issueDaysAgo: number): MTO_AvailableLicencePlate[];
export declare function getParkingTicketsAvailableForMTOConvictionBatch(): ParkingTicket[];
export {};
