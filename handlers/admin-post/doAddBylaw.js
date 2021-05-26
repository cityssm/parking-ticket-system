import { getParkingBylawsWithOffenceStats } from "../../helpers/parkingDB/getParkingBylaws.js";
import addParkingBylaw from "../../helpers/parkingDB/addParkingBylaw.js";
export const handler = (req, res) => {
    const results = addParkingBylaw(req.body);
    if (results.success) {
        results.bylaws = getParkingBylawsWithOffenceStats();
    }
    return res.json(results);
};
