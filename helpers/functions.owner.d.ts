import type { ReconciliationRecord } from '../database/parkingDB/getOwnershipReconciliationRecords.js';
import type { LicencePlateOwner } from '../types/recordTypes.js';
export declare const getFormattedOwnerAddress: (owner: LicencePlateOwner | ReconciliationRecord) => string;
