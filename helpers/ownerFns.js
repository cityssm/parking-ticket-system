"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getFormattedOwnerAddress(owner) {
    return owner.ownerName1 + "\n" +
        (owner.ownerName2 && owner.ownerName2 !== "" ? owner.ownerName2 + "\n" : "") +
        owner.ownerAddress + "\n" +
        owner.ownerCity + ", " + owner.ownerProvince + "  " + owner.ownerPostalCode;
}
exports.getFormattedOwnerAddress = getFormattedOwnerAddress;
