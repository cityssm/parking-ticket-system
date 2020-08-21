/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
import * as sqlite from "better-sqlite3";
import type * as pts from "./ptsTypes";
export declare const canUpdateObject: (obj: pts.Record, reqSession: Express.Session) => boolean;
export declare const getParkingLocationWithDB: (db: sqlite.Database, locationKey: string) => pts.ParkingLocation;
export declare const getRecentParkingTicketVehicleMakeModelValues: () => any[];
export declare const getDistinctLicencePlateOwnerVehicleNCICs: (cutoffDate: number) => {
    vehicleNCIC: string;
    recordDateMax: number;
}[];
