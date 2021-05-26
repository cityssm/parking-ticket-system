import getOwnershipReconciliationRecords from "../../helpers/parkingDB/getOwnershipReconciliationRecords.js";
import getUnacknowledgedLookupErrorLog from "../../helpers/parkingDB/getUnacknowledgedLookupErrorLog.js";
export const handler = (_req, res) => {
    const reconciliationRecords = getOwnershipReconciliationRecords();
    const lookupErrors = getUnacknowledgedLookupErrorLog(-1, -1);
    return res.render("ticket-reconcile", {
        headTitle: "Ownership Reconciliation",
        records: reconciliationRecords,
        errorLog: lookupErrors
    });
};
export default handler;
