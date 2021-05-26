import { getParkingBylawsWithOffenceStats } from "../../helpers/parkingDB/getParkingBylaws.js";
import updateParkingOffencesByBylawNumber from "../../helpers/parkingDB/updateParkingOffencesByBylawNumber.js";
export const handler = (req, res) => {
    const results = updateParkingOffencesByBylawNumber(req.body);
    if (results.success) {
        results.bylaws = getParkingBylawsWithOffenceStats();
    }
    return res.json(results);
};
export default handler;
