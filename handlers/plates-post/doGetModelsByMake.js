import * as vehicleFunctions from "../../helpers/functions.vehicle.js";
export const handler = (request, response) => {
    const makeModelList = vehicleFunctions.getModelsByMakeFromCache(request.body.vehicleMake);
    response.json(makeModelList);
};
export default handler;
