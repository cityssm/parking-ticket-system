import papaparse from 'papaparse';
import { getReportData } from '../../database/parkingDB-reporting.js';
export default function handler(request, response) {
    const reportName = request.params.reportName;
    const rows = getReportData(reportName, request.query);
    if (!rows) {
        response.redirect('/reports/?error=reportNotAvailable');
        return;
    }
    const csv = papaparse.unparse(rows);
    response.setHeader('Content-Disposition', `attachment; filename=${reportName}-${Date.now().toString()}.csv`);
    response.setHeader('Content-Type', 'text/csv');
    response.send(csv);
}
