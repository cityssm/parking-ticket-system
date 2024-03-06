import sqlite from 'better-sqlite3';
interface IsParkingTicketConvictedReturn {
    inBatch: boolean;
    batchIdString?: string;
}
export declare function isParkingTicketInConvictionBatchWithDB(database: sqlite.Database, ticketId: number): IsParkingTicketConvictedReturn;
export default function isParkingTicketInConvictionBatch(ticketId: number): IsParkingTicketConvictedReturn;
export {};
