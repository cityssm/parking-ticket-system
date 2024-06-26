import type { LicencePlate } from '../../types/recordTypes.js';
interface LookupErrorLogEntry extends LicencePlate {
    batchId: number;
    logIndex: number;
    recordDate: number;
    recordDateString: string;
    errorCode: string;
    errorMessage: string;
    ticketId: number;
    ticketNumber: string;
    issueDate: number;
    issueDateString: string;
    vehicleMakeModel: string;
}
export default function getUnacknowledgedLookupErrorLog(batchId_or_negOne: number, logIndex_or_negOne: number): LookupErrorLogEntry[];
export {};
