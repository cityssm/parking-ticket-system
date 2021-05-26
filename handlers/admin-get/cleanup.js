import getDatabaseCleanupCounts from "../../helpers/parkingDB/getDatabaseCleanupCounts.js";
export const handler = (_req, res) => {
    const counts = getDatabaseCleanupCounts();
    return res.render("admin-cleanup", {
        headTitle: "Database Cleanup",
        counts
    });
};
export default handler;
