/// <reference types="express-session" />
export declare const getParkingTicketStatuses: (ticketID: number, reqSession: Express.Session) => import("../ptsTypes").ParkingTicketStatusLog[];
export declare const createParkingTicketStatus: (reqBodyOrObj: import("../ptsTypes").ParkingTicketStatusLog, reqSession: Express.Session, resolveTicket: boolean) => {
    success: boolean;
    statusIndex: number;
};
export declare const updateParkingTicketStatus: (reqBody: import("../ptsTypes").ParkingTicketStatusLog, reqSession: Express.Session) => {
    success: boolean;
};
export declare const deleteParkingTicketStatus: (ticketID: number, statusIndex: number, reqSession: Express.Session) => {
    success: boolean;
};
