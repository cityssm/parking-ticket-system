export declare const getParkingTicketRemarks: (ticketID: number, reqSession: import("express-session").Session) => import("../../types/recordTypes").ParkingTicketRemark[];
export declare const createParkingTicketRemark: (reqBody: import("../../types/recordTypes").ParkingTicketRemark, reqSession: import("express-session").Session) => {
    success: boolean;
};
export declare const updateParkingTicketRemark: (reqBody: import("../../types/recordTypes").ParkingTicketRemark, reqSession: import("express-session").Session) => {
    success: boolean;
};
export declare const deleteParkingTicketRemark: (ticketID: number, remarkIndex: number, reqSession: import("express-session").Session) => {
    success: boolean;
};
