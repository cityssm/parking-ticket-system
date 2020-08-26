"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const ownerFns = require("../../helpers/ownerFns");
const parkingDB_createParkingTicketStatus = require("../../helpers/parkingDB/createParkingTicketStatus");
const parkingDB_getLicencePlateOwner = require("../../helpers/parkingDB/getLicencePlateOwner");
exports.handler = (req, res) => {
    const ownerRecord = parkingDB_getLicencePlateOwner.getLicencePlateOwner(req.body.licencePlateCountry, req.body.licencePlateProvince, req.body.licencePlateNumber, req.body.recordDate);
    if (!ownerRecord) {
        return res.json({
            success: false,
            message: "Ownership record not found."
        });
    }
    const ownerAddress = ownerFns.getFormattedOwnerAddress(ownerRecord);
    const statusResponse = parkingDB_createParkingTicketStatus.createParkingTicketStatus({
        recordType: "status",
        ticketID: parseInt(req.body.ticketID, 10),
        statusKey: "ownerLookupMatch",
        statusField: ownerRecord.recordDate.toString(),
        statusNote: ownerAddress
    }, req.session, false);
    return res.json(statusResponse);
};
