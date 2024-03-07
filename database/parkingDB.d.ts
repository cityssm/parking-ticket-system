import type { Record } from '../types/recordTypes.js';
export declare function canUpdateObject(object: Record, sessionUser: PTSUser): boolean;
export declare function getRecentParkingTicketVehicleMakeModelValues(): string[];
interface GetSplitWhereClauseFilterReturn {
    sqlWhereClause: string;
    sqlParams: string[];
}
export declare function getSplitWhereClauseFilter(columnName: string, searchString: string): GetSplitWhereClauseFilterReturn;
interface GetDistinctLicencePlateOwnerVehicleNCICsReturn {
    vehicleNCIC: string;
    recordDateMax: number;
}
export declare function getDistinctLicencePlateOwnerVehicleNCICs(cutoffDate: number): GetDistinctLicencePlateOwnerVehicleNCICsReturn[];
export {};
