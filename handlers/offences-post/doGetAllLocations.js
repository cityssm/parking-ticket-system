import { getParkingLocations } from "../../helpers/parkingDB/getParkingLocations.js";
export const handler = (_request, response) => {
    response.json(getParkingLocations());
};
export default handler;
