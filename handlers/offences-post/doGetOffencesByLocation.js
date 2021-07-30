import { getParkingOffencesByLocationKey } from "../../helpers/parkingDB/getParkingOffences.js";
export const handler = (request, response) => {
    response.json(getParkingOffencesByLocationKey(request.body.locationKey));
};
export default handler;
