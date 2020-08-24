"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getUnreceivedLookupBatches = require("../../helpers/parkingDB/getUnreceivedLookupBatches");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!(userFns_1.userCanUpdate(req) || userFns_1.userIsOperator(req))) {
        return res.redirect("/plates/?error=accessDenied");
    }
    const unreceivedBatches = parkingDB_getUnreceivedLookupBatches.getUnreceivedLookupBatches(false);
    res.render("mto-plateImport", {
        headTitle: "MTO Licence Plate Ownership Import",
        batches: unreceivedBatches
    });
};
