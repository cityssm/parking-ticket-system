import type * as sqlite from "better-sqlite3";
import type * as pts from "../ptsTypes";
export declare const getParkingLocationWithDB: (db: sqlite.Database, locationKey: string) => pts.ParkingLocation;
