"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getLookupBatch = require("../../helpers/parkingDB/getLookupBatch");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!(userFns_1.userCanUpdate(req) || userFns_1.userIsOperator(req))) {
        return res.redirect("/plates/?error=accessDenied");
    }
    const latestUnlockedBatch = parkingDB_getLookupBatch.getLookupBatch(-1);
    res.render("mto-plateExport", {
        headTitle: "MTO Licence Plate Export",
        batch: latestUnlockedBatch
    });
};
