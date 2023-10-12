import type { LicencePlateOwner } from "../types/recordTypes";
import type { ReconciliationRecord } from "../database/parkingDB/getOwnershipReconciliationRecords";


export const getFormattedOwnerAddress = (owner: LicencePlateOwner | ReconciliationRecord): string => {

  const fieldPrefix = ("ownerName1" in owner ? "" : "owner_");

  return (owner[fieldPrefix + "ownerName1"] as string) + "\n" +
    (owner[fieldPrefix + "ownerName2"] && owner[fieldPrefix + "ownerName2"] !== ""
      ? (owner[fieldPrefix + "ownerName2"] as string) + "\n"
      : "") +
    (owner[fieldPrefix + "ownerAddress"] as string) + "\n" +
    (owner[fieldPrefix + "ownerCity"] as string) + ", " +
    (owner[fieldPrefix + "ownerProvince"] as string) + "  " +
    (owner[fieldPrefix + "ownerPostalCode"] as string);
};
