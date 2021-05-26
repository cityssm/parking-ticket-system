import getParkingLocations from "../../helpers/parkingDB/getParkingLocations.js";
export const handler = (_req, res) => {
    res.json(getParkingLocations());
};
export default handler;
