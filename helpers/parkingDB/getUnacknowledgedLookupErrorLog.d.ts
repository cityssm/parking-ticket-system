import type * as pts from "../ptsTypes";
interface LookupErrorLogEntry extends pts.LicencePlate {
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
export declare const getUnacknowledgedLookupErrorLog: (batchID_or_negOne: number, logIndex_or_negOne: number) => LookupErrorLogEntry[];
export {};
