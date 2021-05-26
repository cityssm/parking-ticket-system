import parkingDB_getParkingBylaws from "../../helpers/parkingDB/getParkingBylaws.js";
export const handler = (_req, res) => {
    const bylaws = parkingDB_getParkingBylaws.getParkingBylawsWithOffenceStats();
    return res.render("bylaw-maint", {
        headTitle: "By-Law Maintenance",
        bylaws
    });
};
export default handler;
