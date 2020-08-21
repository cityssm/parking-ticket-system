import type { RequestHandler } from "express";

import * as ownerFns from "../../helpers/ownerFns";

import * as parkingDB_createParkingTicketStatus from "../../helpers/parkingDB/createParkingTicketStatus";
import * as parkingDB_getLicencePlateOwner from "../../helpers/parkingDB/getLicencePlateOwner";

import { userCanUpdate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const ownerRecord = parkingDB_getLicencePlateOwner.getLicencePlateOwner(
    req.body.licencePlateCountry,
    req.body.licencePlateProvince,
    req.body.licencePlateNumber,
    req.body.recordDate
  );

  if (!ownerRecord) {

    return res.json({
      success: false,
      message: "Ownership record not found."
    });
  }

  const ownerAddress = ownerFns.getFormattedOwnerAddress(ownerRecord);

  const statusResponse = parkingDB_createParkingTicketStatus.createParkingTicketStatus(
    {
      recordType: "status",
      ticketID: parseInt(req.body.ticketID, 10),
      statusKey: "ownerLookupMatch",
      statusField: ownerRecord.recordDate.toString(),
      statusNote: ownerAddress
    },
    req.session,
    false
  );

  return res.json(statusResponse);
};
