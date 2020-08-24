"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const mtoFns = require("../../helpers/mtoFns");
const userFns_1 = require("../../helpers/userFns");
exports.handler = (req, res) => {
    if (!(userFns_1.userCanUpdate(req) || userFns_1.userIsOperator(req))) {
        return res.redirect("/tickets/?error=accessDenied");
    }
    const batchID = parseInt(req.params.batchID, 10);
    const output = mtoFns.exportConvictionBatch(batchID, req.session);
    res.setHeader("Content-Disposition", "attachment; filename=convictBatch-" + batchID.toString() + ".txt");
    res.setHeader("Content-Type", "text/plain");
    res.send(output);
};
