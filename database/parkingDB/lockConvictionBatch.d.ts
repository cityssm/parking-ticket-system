interface LockConvictionBatchReturn {
    success: boolean;
    lockDate: number;
    lockDateString: string;
}
export declare const lockConvictionBatch: (batchID: number, sessionUser: PTSUser) => LockConvictionBatchReturn;
export default lockConvictionBatch;
