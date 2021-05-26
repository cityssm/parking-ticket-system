export declare const getParkingTicketStatuses: (ticketID: number, reqSession: import("express-session").Session) => import("../../types/recordTypes.js").ParkingTicketStatusLog[];
export declare const createParkingTicketStatus: (reqBodyOrObj: import("../../types/recordTypes.js").ParkingTicketStatusLog, reqSession: import("express-session").Session, resolveTicket: boolean) => {
    success: boolean;
    statusIndex: number;
};
export declare const updateParkingTicketStatus: (reqBody: import("../../types/recordTypes.js").ParkingTicketStatusLog, reqSession: import("express-session").Session) => {
    success: boolean;
};
export declare const deleteParkingTicketStatus: (ticketID: number, statusIndex: number, reqSession: import("express-session").Session) => {
    success: boolean;
};
