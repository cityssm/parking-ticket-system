import getParkingLocations from "../../helpers/parkingDB/getParkingLocations.js";
import addParkingLocation from "../../helpers/parkingDB/addParkingLocation.js";
export const handler = (req, res) => {
    const results = addParkingLocation(req.body);
    if (results.success) {
        results.locations = getParkingLocations();
    }
    return res.json(results);
};
export default handler;
