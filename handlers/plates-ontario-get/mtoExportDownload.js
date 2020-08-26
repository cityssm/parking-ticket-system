"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const mtoFns = require("../../helpers/mtoFns");
exports.handler = (req, res) => {
    const batchID = parseInt(req.params.batchID, 10);
    const output = mtoFns.exportLicencePlateBatch(batchID, req.session);
    res.setHeader("Content-Disposition", "attachment; filename=lookupBatch-" + batchID.toString() + ".txt");
    res.setHeader("Content-Type", "text/plain");
    res.send(output);
};
