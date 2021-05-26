import parkingDB_getParkingLocations from "../../helpers/parkingDB/getParkingLocations.js";
import parkingDB_getParkingBylaws from "../../helpers/parkingDB/getParkingBylaws.js";
import parkingDB_getParkingOffences from "../../helpers/parkingDB/getParkingOffences.js";
export const handler = (_req, res) => {
    const locations = parkingDB_getParkingLocations.getParkingLocations();
    const bylaws = parkingDB_getParkingBylaws.getParkingBylaws();
    const offences = parkingDB_getParkingOffences.getParkingOffences();
    return res.render("offence-maint", {
        headTitle: "Parking Offences",
        locations,
        bylaws,
        offences
    });
};
export default handler;
