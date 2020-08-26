/// <reference types="express-session" />
export declare const getParkingTicketStatuses: (ticketID: number, reqSession: Express.Session) => import("../../types/recordTypes").ParkingTicketStatusLog[];
export declare const createParkingTicketStatus: (reqBodyOrObj: import("../../types/recordTypes").ParkingTicketStatusLog, reqSession: Express.Session, resolveTicket: boolean) => {
    success: boolean;
    statusIndex: number;
};
export declare const updateParkingTicketStatus: (reqBody: import("../../types/recordTypes").ParkingTicketStatusLog, reqSession: Express.Session) => {
    success: boolean;
};
export declare const deleteParkingTicketStatus: (ticketID: number, statusIndex: number, reqSession: Express.Session) => {
    success: boolean;
};
