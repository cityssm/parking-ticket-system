/// <reference types="express-serve-static-core" />
/// <reference types="compression" />
/// <reference types="express-session" />
/// <reference types="multer" />
export declare const resolveParkingTicket: (ticketID: number, reqSession: Express.Session) => {
    success: boolean;
};
