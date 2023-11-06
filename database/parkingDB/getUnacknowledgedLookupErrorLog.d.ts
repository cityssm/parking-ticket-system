import type { LicencePlate } from '../../types/recordTypes.js';
interface LookupErrorLogEntry extends LicencePlate {
    batchID: number;
    logIndex: number;
    recordDate: number;
    recordDateString: string;
    errorCode: string;
    errorMessage: string;
    ticketID: number;
    ticketNumber: string;
    issueDate: number;
    issueDateString: string;
    vehicleMakeModel: string;
}
export declare function getUnacknowledgedLookupErrorLog(batchID_or_negOne: number, logIndex_or_negOne: number): LookupErrorLogEntry[];
export default getUnacknowledgedLookupErrorLog;
