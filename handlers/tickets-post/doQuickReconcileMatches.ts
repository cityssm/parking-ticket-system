import type { RequestHandler } from "express";

import * as ownerFns from "../../helpers/ownerFns";

import * as parkingDB_createParkingTicketStatus from "../../helpers/parkingDB/createParkingTicketStatus";
import * as parkingDB_getOwnershipReconciliationRecords from "../../helpers/parkingDB/getOwnershipReconciliationRecords";

import { userCanUpdate, forbiddenJSON } from "../../helpers/userFns";


export const handler: RequestHandler = (req, res) => {

  if (!userCanUpdate(req)) {
    return forbiddenJSON(res);
  }

  const records = parkingDB_getOwnershipReconciliationRecords.getOwnershipReconciliationRecords();

  const statusRecords: Array<{ ticketID: number; statusIndex: number }> = [];

  for (const record of records) {
    if (!record.isVehicleMakeMatch || !record.isLicencePlateExpiryDateMatch) {
      continue;
    }

    const ownerAddress = ownerFns.getFormattedOwnerAddress(record);

    const statusResponse = parkingDB_createParkingTicketStatus.createParkingTicketStatus(
      {
        recordType: "status",
        ticketID: record.ticket_ticketID,
        statusKey: "ownerLookupMatch",
        statusField: record.owner_recordDateString,
        statusNote: ownerAddress
      },
      req.session,
      false
    );

    if (statusResponse.success) {
      statusRecords.push({
        ticketID: record.ticket_ticketID,
        statusIndex: statusResponse.statusIndex
      });
    }
  }

  return res.json({
    success: true,
    statusRecords
  });
};
