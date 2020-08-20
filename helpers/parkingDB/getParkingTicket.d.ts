/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
import type * as pts from "../ptsTypes";
export declare const getParkingTicket: (ticketID: number, reqSession: Express.Session) => pts.ParkingTicket;
