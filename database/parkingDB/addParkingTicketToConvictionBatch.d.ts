export declare function addParkingTicketToConvictionBatch(batchID: number, ticketID: number, sessionUser: PTSUser): {
    success: boolean;
    message?: string;
};
export declare const addAllParkingTicketsToConvictionBatch: (batchID: number, ticketIDs: number[], sessionUser: PTSUser) => {
    success: boolean;
    successCount: number;
    message?: string | undefined;
};
export default addParkingTicketToConvictionBatch;
