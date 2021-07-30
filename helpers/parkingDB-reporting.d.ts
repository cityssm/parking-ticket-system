import type { RawRowsColumnsReturn } from "@cityssm/expressjs-server-js/types";
export declare const getReportRowsColumns: (reportName: string, requestQuery: {
    [key: string]: string;
}) => RawRowsColumnsReturn;
