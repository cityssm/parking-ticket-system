import * as parkingDB_reporting from "../../helpers/parkingDB-reporting.js";
import papaparse from "papaparse";
export const handler = (request, response) => {
    const reportName = request.params.reportName;
    const rows = parkingDB_reporting.getReportData(reportName, request.query);
    if (!rows) {
        response.redirect("/reports/?error=reportNotAvailable");
        return;
    }
    const csv = papaparse.unparse(rows);
    response.setHeader("Content-Disposition", "attachment; filename=" + reportName + "-" + Date.now().toString() + ".csv");
    response.setHeader("Content-Type", "text/csv");
    response.send(csv);
};
export default handler;
