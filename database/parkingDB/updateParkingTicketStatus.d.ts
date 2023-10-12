import type * as expressSession from 'express-session';
import type { ParkingTicketStatusLog } from '../../types/recordTypes.js';
export declare const updateParkingTicketStatus: (requestBody: ParkingTicketStatusLog, requestSession: expressSession.Session) => {
    success: boolean;
};
export default updateParkingTicketStatus;
