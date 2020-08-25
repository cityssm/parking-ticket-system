/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
import * as sqlite from "better-sqlite3";
import type * as pts from "../ptsTypes";
export declare const getParkingTicketStatusesWithDB: (db: sqlite.Database, ticketID: number, reqSession: Express.Session) => pts.ParkingTicketStatusLog[];
export declare const getParkingTicketStatuses: (ticketID: number, reqSession: Express.Session) => pts.ParkingTicketStatusLog[];
