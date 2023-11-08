interface LockConvictionBatchReturn {
    success: boolean;
    lockDate: number;
    lockDateString: string;
}
export declare function lockConvictionBatch(batchId: number, sessionUser: PTSUser): LockConvictionBatchReturn;
export default lockConvictionBatch;
