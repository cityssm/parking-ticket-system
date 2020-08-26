import * as sqlite from "better-sqlite3";
export declare const isConvictionBatchUpdatableWithDB: (db: sqlite.Database, batchID: number) => boolean;
export declare const isConvictionBatchUpdatable: (ticketID: number) => boolean;
