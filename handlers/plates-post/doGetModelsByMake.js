import { getModelsByMakeFromCache } from '../../helpers/functions.vehicle.js';
export default function handler(request, response) {
    const makeModelList = getModelsByMakeFromCache(request.body.vehicleMake);
    response.json(makeModelList);
}
