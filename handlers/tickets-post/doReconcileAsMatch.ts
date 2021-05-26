import type { RequestHandler } from "express";

import * as ownerFns from "../../helpers/ownerFns.js";

import createParkingTicketStatus from "../../helpers/parkingDB/createParkingTicketStatus.js";
import getLicencePlateOwner from "../../helpers/parkingDB/getLicencePlateOwner.js";


export const handler: RequestHandler = (req, res) => {

  const ownerRecord = getLicencePlateOwner(
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

  const statusResponse = createParkingTicketStatus(
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


export default handler;
