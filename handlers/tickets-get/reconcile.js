"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getOwnershipReconciliationRecords = require("../../helpers/parkingDB/getOwnershipReconciliationRecords");
const parkingDB_getUnacknowledgedLookupErrorLog = require("../../helpers/parkingDB/getUnacknowledgedLookupErrorLog");
exports.handler = (_req, res) => {
    const reconciliationRecords = parkingDB_getOwnershipReconciliationRecords.getOwnershipReconciliationRecords();
    const lookupErrors = parkingDB_getUnacknowledgedLookupErrorLog.getUnacknowledgedLookupErrorLog(-1, -1);
    return res.render("ticket-reconcile", {
        headTitle: "Ownership Reconciliation",
        records: reconciliationRecords,
        errorLog: lookupErrors
    });
};
