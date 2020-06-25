import type { LicencePlateOwner } from "./ptsTypes";
import { ReconciliationRecord } from "./parkingDB-lookup";
export declare const getFormattedOwnerAddress: (owner: LicencePlateOwner | ReconciliationRecord) => string;
