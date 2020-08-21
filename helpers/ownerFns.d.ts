import type { LicencePlateOwner } from "./ptsTypes";
import type { ReconciliationRecord } from "./parkingDB/getOwnershipReconciliationRecords";
export declare const getFormattedOwnerAddress: (owner: LicencePlateOwner | ReconciliationRecord) => string;
