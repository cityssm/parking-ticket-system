import type { LicencePlateOwner } from "./ptsTypes";
import { ReconciliationRecord } from "./parkingDB-lookup";
export declare function getFormattedOwnerAddress(owner: LicencePlateOwner | ReconciliationRecord): string;
