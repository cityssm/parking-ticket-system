export default function removeParkingTicketFromConvictionBatch(batchId: number, ticketId: number, sessionUser: PTSUser): {
    success: boolean;
    message?: string;
};
