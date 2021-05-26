import type * as recordTypes from "../types/recordTypes";
import type * as expressSession from "express-session";
export declare const canUpdateObject: (obj: recordTypes.Record, reqSession: expressSession.Session) => boolean;
export declare const getRecentParkingTicketVehicleMakeModelValues: () => any[];
export declare const getSplitWhereClauseFilter: (columnName: string, searchString: string) => {
    sqlWhereClause: string;
    sqlParams: any[];
};
export declare const getDistinctLicencePlateOwnerVehicleNCICs: (cutoffDate: number) => {
    vehicleNCIC: string;
    recordDateMax: number;
}[];
