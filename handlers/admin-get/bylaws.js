import { getParkingBylawsWithOffenceStats } from "../../helpers/parkingDB/getParkingBylaws.js";
export const handler = (_req, res) => {
    const bylaws = getParkingBylawsWithOffenceStats();
    return res.render("bylaw-maint", {
        headTitle: "By-Law Maintenance",
        bylaws
    });
};
export default handler;
