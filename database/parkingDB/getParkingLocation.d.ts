import type sqlite from 'better-sqlite3';
import type { ParkingLocation } from '../../types/recordTypes.js';
export declare const getParkingLocationWithDB: (database: sqlite.Database, locationKey: string) => ParkingLocation;
