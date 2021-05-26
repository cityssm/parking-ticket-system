import getParkingLocations from "../../helpers/parkingDB/getParkingLocations.js";
import updateParkingLocation from "../../helpers/parkingDB/updateParkingLocation.js";
export const handler = (req, res) => {
    const results = updateParkingLocation(req.body);
    if (results.success) {
        results.locations = getParkingLocations();
    }
    return res.json(results);
};
export default handler;
