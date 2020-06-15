export declare function getDatabaseCleanupCounts(): {
    recordDelete_timeMillis: number;
    parkingTickets: any;
    parkingTicketStatusLog: any;
    parkingTicketRemarks: any;
    licencePlateOwners: any;
    parkingLocations: any;
    parkingBylaws: any;
    parkingOffences: any;
};
export declare function cleanupParkingTicketsTable(recordDelete_timeMillis: number): boolean;
export declare function cleanupParkingTicketRemarksTable(recordDelete_timeMillis: number): boolean;
export declare function cleanupParkingTicketStatusLog(recordDelete_timeMillis: number): boolean;
export declare function cleanupLicencePlateOwnersTable(recordDelete_timeMillis: number): boolean;
export declare function cleanupParkingOffencesTable(): boolean;
export declare function cleanupParkingLocationsTable(): boolean;
export declare function cleanupParkingBylawsTable(): boolean;
