import type { RequestHandler } from "express";

import * as parkingDB_getOwnershipReconciliationRecords from "../../helpers/parkingDB/getOwnershipReconciliationRecords";
import * as parkingDB_getUnacknowledgedLookupErrorLog from "../../helpers/parkingDB/getUnacknowledgedLookupErrorLog";


export const handler: RequestHandler = (_req, res) => {

  const reconciliationRecords = parkingDB_getOwnershipReconciliationRecords.getOwnershipReconciliationRecords();

  const lookupErrors = parkingDB_getUnacknowledgedLookupErrorLog.getUnacknowledgedLookupErrorLog(
    -1,
    -1
  );

  return res.render("ticket-reconcile", {
    headTitle: "Ownership Reconciliation",
    records: reconciliationRecords,
    errorLog: lookupErrors
  });
};
