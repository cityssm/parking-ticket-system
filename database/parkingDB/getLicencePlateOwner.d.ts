import sqlite from 'better-sqlite3';
import type { LicencePlateOwner } from '../../types/recordTypes.js';
export declare function getLicencePlateOwner(licencePlateCountry: string, licencePlateProvince: string, licencePlateNumber: string, recordDateOrBefore: number, connectedDatabase?: sqlite.Database): Promise<LicencePlateOwner | undefined>;
export default getLicencePlateOwner;
