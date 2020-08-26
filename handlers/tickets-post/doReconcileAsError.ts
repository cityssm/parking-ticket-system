import type { RequestHandler } from "express";

import * as parkingDB_createParkingTicketStatus from "../../helpers/parkingDB/createParkingTicketStatus";
import * as parkingDB_getLicencePlateOwner from "../../helpers/parkingDB/getLicencePlateOwner";


export const handler: RequestHandler = (req, res) => {

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

  const statusResponse = parkingDB_createParkingTicketStatus.createParkingTicketStatus(
    {
      recordType: "status",
      ticketID: parseInt(req.body.ticketID, 10),
      statusKey: "ownerLookupError",
      statusField: ownerRecord.vehicleNCIC,
      statusNote: ""
    },
    req.session,
    false
  );

  return res.json(statusResponse);
};
