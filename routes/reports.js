import { Router } from "express";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns.js";
import handler_reportName from "../handlers/reports-all/reportName.js";
export const router = Router();
router.get("/", (_req, res) => {
    const rightNow = new Date();
    res.render("report-search", {
        headTitle: "Reports",
        todayDateString: dateTimeFns.dateToString(rightNow)
    });
});
router.all("/:reportName", handler_reportName);
export default router;
