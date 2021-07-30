import type { RequestHandler } from "express";

import { getOwnershipReconciliationRecords } from "../../helpers/parkingDB/getOwnershipReconciliationRecords.js";
import { getUnacknowledgedLookupErrorLog } from "../../helpers/parkingDB/getUnacknowledgedLookupErrorLog.js";


export const handler: RequestHandler = (_request, response) => {

  const reconciliationRecords = getOwnershipReconciliationRecords();

  const lookupErrors = getUnacknowledgedLookupErrorLog(-1, -1);

  return response.render("ticket-reconcile", {
    headTitle: "Ownership Reconciliation",
    records: reconciliationRecords,
    errorLog: lookupErrors
  });
};


export default handler;
