"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getUnreceivedLookupBatches = require("../../helpers/parkingDB/getUnreceivedLookupBatches");
exports.handler = (req, res) => {
    const unreceivedBatches = parkingDB_getUnreceivedLookupBatches.getUnreceivedLookupBatches(false);
    res.render("mto-plateImport", {
        headTitle: "MTO Licence Plate Ownership Import",
        batches: unreceivedBatches
    });
};
