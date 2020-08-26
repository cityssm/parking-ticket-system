/// <reference types="express-session" />
export declare const getParkingTicketRemarks: (ticketID: number, reqSession: Express.Session) => import("../../types/recordTypes").ParkingTicketRemark[];
export declare const createParkingTicketRemark: (reqBody: import("../../types/recordTypes").ParkingTicketRemark, reqSession: Express.Session) => {
    success: boolean;
};
export declare const updateParkingTicketRemark: (reqBody: import("../../types/recordTypes").ParkingTicketRemark, reqSession: Express.Session) => {
    success: boolean;
};
export declare const deleteParkingTicketRemark: (ticketID: number, remarkIndex: number, reqSession: Express.Session) => {
    success: boolean;
};
