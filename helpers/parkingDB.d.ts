/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
import type * as pts from "./ptsTypes";
export declare const canUpdateObject: (obj: pts.Record, reqSession: Express.Session) => boolean;
export declare const getRecentParkingTicketVehicleMakeModelValues: () => any[];
export declare const getSplitWhereClauseFilter: (columnName: string, searchString: string) => {
    sqlWhereClause: string;
    sqlParams: any[];
};
export declare const getDistinctLicencePlateOwnerVehicleNCICs: (cutoffDate: number) => {
    vehicleNCIC: string;
    recordDateMax: number;
}[];
