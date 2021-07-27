import * as vehicleFunctions from "../../helpers/functions.vehicle.js";
export const handler = (req, res) => {
    const makeModelList = vehicleFunctions.getModelsByMakeFromCache(req.body.vehicleMake);
    res.json(makeModelList);
};
export default handler;
