export declare const getParkingTicketRemarks: (ticketID: number, requestSession: import("express-session").Session) => import("../../types/recordTypes").ParkingTicketRemark[];
export declare const createParkingTicketRemark: (requestBody: import("../../types/recordTypes").ParkingTicketRemark, requestSession: import("express-session").Session) => {
    success: boolean;
};
export declare const updateParkingTicketRemark: (requestBody: import("../../types/recordTypes").ParkingTicketRemark, requestSession: import("express-session").Session) => {
    success: boolean;
};
export declare const deleteParkingTicketRemark: (ticketID: number, remarkIndex: number, requestSession: import("express-session").Session) => {
    success: boolean;
};
