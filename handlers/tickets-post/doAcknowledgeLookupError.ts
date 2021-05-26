import type { RequestHandler } from "express";

import createParkingTicketStatus from "../../helpers/parkingDB/createParkingTicketStatus.js";
import acknowledgeLookupErrorLogEntry from "../../helpers/parkingDB/acknowledgeLookupErrorLogEntry.js";
import getUnacknowledgedLookupErrorLog from "../../helpers/parkingDB/getUnacknowledgedLookupErrorLog.js";


export const handler: RequestHandler = (req, res) => {

  // Get log entry

  const logEntries = getUnacknowledgedLookupErrorLog(
    req.body.batchID,
    req.body.logIndex
  );

  if (logEntries.length === 0) {

    return res.json({
      success: false,
      message: "Log entry not found.  It may have already been acknowledged."
    });
  }

  // Set status on parking ticket

  const statusResponse = createParkingTicketStatus(
    {
      recordType: "status",
      ticketID: logEntries[0].ticketID,
      statusKey: "ownerLookupError",
      statusField: "",
      statusNote:
        logEntries[0].errorMessage + " (" + logEntries[0].errorCode + ")"
    },
    req.session,
    false
  );

  if (!statusResponse.success) {

    return res.json({
      success: false,
      message:
        "Unable to update the status on the parking ticket.  It may have been resolved."
    });
  }

  // Mark log entry as acknowledged

  const success = acknowledgeLookupErrorLogEntry(
    req.body.batchID,
    req.body.logIndex,
    req.session
  );

  return res.json({
    success
  });
};

export default handler;
