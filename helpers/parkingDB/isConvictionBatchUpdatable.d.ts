import sqlite from "better-sqlite3";
export declare const isConvictionBatchUpdatableWithDB: (database: sqlite.Database, batchID: number) => boolean;
export declare const isConvictionBatchUpdatable: (ticketID: number) => boolean;
export default isConvictionBatchUpdatable;
