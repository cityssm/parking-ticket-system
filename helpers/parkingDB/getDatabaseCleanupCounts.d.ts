interface GetDatabaseCleanupCountsReturn {
    recordDelete_timeMillis: number;
    parkingTickets: number;
    parkingTicketStatusLog: number;
    parkingTicketRemarks: number;
    licencePlateOwners: number;
    parkingLocations: number;
    parkingBylaws: number;
    parkingOffences: number;
}
export declare const getDatabaseCleanupCounts: () => GetDatabaseCleanupCountsReturn;
export default getDatabaseCleanupCounts;
