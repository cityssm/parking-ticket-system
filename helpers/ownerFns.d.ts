import type { LicencePlateOwner } from "../types/recordTypes";
import type { ReconciliationRecord } from "./parkingDB/getOwnershipReconciliationRecords";
export declare const getFormattedOwnerAddress: (owner: LicencePlateOwner | ReconciliationRecord) => string;
