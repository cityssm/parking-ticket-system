import sqlite from 'better-sqlite3';
import { LicencePlateOwner } from '../../types/recordTypes.js';
export declare function getLicencePlateOwnerWithDB(database: sqlite.Database, licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, recordDateOrBefore: number): LicencePlateOwner | undefined;
export declare function getLicencePlateOwner(licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, recordDateOrBefore: number): LicencePlateOwner | undefined;
export default getLicencePlateOwner;
