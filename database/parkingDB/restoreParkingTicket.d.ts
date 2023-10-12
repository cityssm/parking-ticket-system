import type * as expressSession from 'express-session';
export declare const restoreParkingTicket: (ticketID: number, requestSession: expressSession.Session) => {
    success: boolean;
};
export default restoreParkingTicket;
