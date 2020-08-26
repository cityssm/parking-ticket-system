"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const parkingDB_getLookupBatch = require("../../helpers/parkingDB/getLookupBatch");
exports.handler = (_req, res) => {
    const latestUnlockedBatch = parkingDB_getLookupBatch.getLookupBatch(-1);
    res.render("mto-plateExport", {
        headTitle: "MTO Licence Plate Export",
        batch: latestUnlockedBatch
    });
};
