import { getParkingLocations } from "../../helpers/parkingDB/getParkingLocations.js";
import { getParkingBylaws } from "../../helpers/parkingDB/getParkingBylaws.js";
import { getParkingOffences } from "../../helpers/parkingDB/getParkingOffences.js";
export const handler = (_request, response) => {
    const locations = getParkingLocations();
    const bylaws = getParkingBylaws();
    const offences = getParkingOffences();
    return response.render("offence-maint", {
        headTitle: "Parking Offences",
        locations,
        bylaws,
        offences
    });
};
export default handler;
