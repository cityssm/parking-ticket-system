import { getParkingOffencesByLocationKey } from "../../helpers/parkingDB/getParkingOffences.js";
export const handler = (req, res) => {
    res.json(getParkingOffencesByLocationKey(req.body.locationKey));
};
export default handler;
