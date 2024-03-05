export declare function addParkingTicketToConvictionBatch(batchId: number, ticketId: number, sessionUser: PTSUser): {
    success: boolean;
    message?: string;
};
export declare function addAllParkingTicketsToConvictionBatch(batchId: number, ticketIds: number[], sessionUser: PTSUser): {
    success: boolean;
    successCount: number;
    message?: string;
};
export default addParkingTicketToConvictionBatch;
