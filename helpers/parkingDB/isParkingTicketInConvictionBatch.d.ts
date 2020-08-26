import type * as sqlite from "better-sqlite3";
export declare const isParkingTicketInConvictionBatch: (db: sqlite.Database, ticketID: number) => {
    inBatch: boolean;
    batchIDString: string;
} | {
    inBatch: boolean;
    batchIDString?: undefined;
};
