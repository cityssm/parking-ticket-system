import type { LicencePlateOwner } from "../types/recordTypes";
import type { ReconciliationRecord } from "../database/parkingDB/getOwnershipReconciliationRecords";
export declare const getFormattedOwnerAddress: (owner: LicencePlateOwner | ReconciliationRecord) => string;
