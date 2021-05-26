import sqlite from "better-sqlite3";
export declare const isParkingTicketInConvictionBatchWithDB: (db: sqlite.Database, ticketID: number) => {
    inBatch: boolean;
    batchIDString: string;
} | {
    inBatch: boolean;
    batchIDString?: undefined;
};
export declare const isParkingTicketInConvictionBatch: (ticketID: number) => {
    inBatch: boolean;
    batchIDString: string;
} | {
    inBatch: boolean;
    batchIDString?: undefined;
};
export default isParkingTicketInConvictionBatch;
