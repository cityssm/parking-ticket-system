interface IsParkingTicketConvictedReturn {
    inBatch: boolean;
    batchIDString?: string;
}
export declare const isParkingTicketInConvictionBatchWithDB: (database: sqlite.Database, ticketID: number) => IsParkingTicketConvictedReturn;
export declare const isParkingTicketInConvictionBatch: (ticketID: number) => IsParkingTicketConvictedReturn;
export default isParkingTicketInConvictionBatch;
