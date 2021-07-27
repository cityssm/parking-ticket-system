import * as mtoFunctions from "../../helpers/functions.mto.js";
export const handler = (req, res) => {
    const batchID = parseInt(req.params.batchID, 10);
    const output = mtoFunctions.exportConvictionBatch(batchID, req.session);
    res.setHeader("Content-Disposition", "attachment; filename=convictBatch-" + batchID.toString() + ".txt");
    res.setHeader("Content-Type", "text/plain");
    res.send(output);
};
export default handler;
