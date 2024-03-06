interface LockConvictionBatchReturn {
    success: boolean;
    lockDate: number;
    lockDateString: string;
}
export default function lockConvictionBatch(batchId: number, sessionUser: PTSUser): LockConvictionBatchReturn;
export {};
