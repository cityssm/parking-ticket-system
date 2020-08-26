"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const mtoFns = require("../../helpers/mtoFns");
exports.handler = (req, res) => {
    const batchID = parseInt(req.params.batchID, 10);
    const output = mtoFns.exportConvictionBatch(batchID, req.session);
    res.setHeader("Content-Disposition", "attachment; filename=convictBatch-" + batchID.toString() + ".txt");
    res.setHeader("Content-Type", "text/plain");
    res.send(output);
};
