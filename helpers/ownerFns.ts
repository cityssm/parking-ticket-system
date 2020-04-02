import { LicencePlateOwner } from "./ptsTypes";
import { ReconciliationRecord } from "./parkingDB";


export function getFormattedOwnerAddress(owner: LicencePlateOwner | ReconciliationRecord) {

  const fieldPrefix = ("ownerName1" in owner ? "" : "owner_");

  return owner[fieldPrefix + "ownerName1"] + "\n" +
    (owner[fieldPrefix + "ownerName2"] && owner[fieldPrefix + "ownerName2"] !== "" ?
     owner[fieldPrefix + "ownerName2"] + "\n" :
     "") +
    owner[fieldPrefix + "ownerAddress"] + "\n" +
    owner[fieldPrefix + "ownerCity"] + ", " + owner[fieldPrefix + "ownerProvince"] + "  " +
    owner[fieldPrefix + "ownerPostalCode"];
}
