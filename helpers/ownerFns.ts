import type { LicencePlateOwner } from "./ptsTypes";
import type { ReconciliationRecord } from "./parkingDB-lookup";


export const getFormattedOwnerAddress = (owner: LicencePlateOwner | ReconciliationRecord) => {

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
