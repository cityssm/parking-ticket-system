/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
export declare const deleteParkingTicketStatus: (ticketID: number, statusIndex: number, reqSession: Express.Session) => {
    success: boolean;
};
