import type { RawRowsColumnsReturn } from "@cityssm/expressjs-server-js/types";
export declare const getReportRowsColumns: (reportName: string, reqQuery: {
    [key: string]: string;
}) => RawRowsColumnsReturn;
