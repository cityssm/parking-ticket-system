import type * as sqlite from 'better-sqlite3';
import type * as pts from '../../types/recordTypes';
export declare const getParkingLocationWithDB: (database: sqlite.Database, locationKey: string) => pts.ParkingLocation;
