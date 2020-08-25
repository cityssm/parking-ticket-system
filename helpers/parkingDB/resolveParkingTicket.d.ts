/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
import * as sqlite from "better-sqlite3";
export declare const resolveParkingTicketWithDB: (db: sqlite.Database, ticketID: number, reqSession: Express.Session) => {
    success: boolean;
};
export declare const resolveParkingTicket: (ticketID: number, reqSession: Express.Session) => {
    success: {
        success: boolean;
    };
};
