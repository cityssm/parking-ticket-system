export declare const getDatabaseCleanupCounts: () => {
    recordDelete_timeMillis: number;
    parkingTickets: any;
    parkingTicketStatusLog: any;
    parkingTicketRemarks: any;
    licencePlateOwners: any;
    parkingLocations: any;
    parkingBylaws: any;
    parkingOffences: any;
};
export declare const cleanupParkingTicketsTable: (recordDelete_timeMillis: number) => boolean;
export declare const cleanupParkingTicketRemarksTable: (recordDelete_timeMillis: number) => boolean;
export declare const cleanupParkingTicketStatusLog: (recordDelete_timeMillis: number) => boolean;
export declare const cleanupLicencePlateOwnersTable: (recordDelete_timeMillis: number) => boolean;
export declare const cleanupParkingOffencesTable: () => boolean;
export declare const cleanupParkingLocationsTable: () => boolean;
export declare const cleanupParkingBylawsTable: () => boolean;
