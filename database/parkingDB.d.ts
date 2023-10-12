import type * as expressSession from 'express-session';
import type { Record } from '../types/recordTypes.js';
export declare const canUpdateObject: (object: Record, requestSession: expressSession.Session) => boolean;
export declare const getRecentParkingTicketVehicleMakeModelValues: () => string[];
interface GetSplitWhereClauseFilterReturn {
    sqlWhereClause: string;
    sqlParams: string[];
}
export declare const getSplitWhereClauseFilter: (columnName: string, searchString: string) => GetSplitWhereClauseFilterReturn;
interface GetDistinctLicencePlateOwnerVehicleNCICsReturn {
    vehicleNCIC: string;
    recordDateMax: number;
}
export declare const getDistinctLicencePlateOwnerVehicleNCICs: (cutoffDate: number) => GetDistinctLicencePlateOwnerVehicleNCICsReturn[];
export {};
