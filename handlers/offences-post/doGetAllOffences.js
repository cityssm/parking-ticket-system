import getParkingOffences from "../../helpers/parkingDB/getParkingOffences.js";
export const handler = (_req, res) => {
    res.json(getParkingOffences());
};
export default handler;
