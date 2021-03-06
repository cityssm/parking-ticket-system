import * as sqlite from "better-sqlite3";
import type * as pts from "../../types/recordTypes";
export declare const getLicencePlateOwnerWithDB: (db: sqlite.Database, licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, recordDateOrBefore: number) => pts.LicencePlateOwner;
export declare const getLicencePlateOwner: (licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, recordDateOrBefore: number) => pts.LicencePlateOwner;
