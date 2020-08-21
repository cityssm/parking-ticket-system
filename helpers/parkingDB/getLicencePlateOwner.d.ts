import * as sqlite from "better-sqlite3";
import type * as pts from "../ptsTypes";
export declare const getLicencePlateOwnerWithDB: (db: sqlite.Database, licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, recordDateOrBefore: number) => pts.LicencePlateOwner;
export declare const getLicencePlateOwner: (licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, recordDateOrBefore: number) => pts.LicencePlateOwner;
