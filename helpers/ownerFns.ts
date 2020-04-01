import { LicencePlateOwner } from "./ptsTypes";


export function getFormattedOwnerAddress(owner: LicencePlateOwner) {

  return owner.ownerName1 + "\n" +
    (owner.ownerName2 && owner.ownerName2 !== "" ? owner.ownerName2 + "\n" : "") +
    owner.ownerAddress + "\n" +
    owner.ownerCity + ", " + owner.ownerProvince + "  " + owner.ownerPostalCode;
}
