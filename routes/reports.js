import * as dateTimeFns from '@cityssm/utils-datetime';
import { Router } from 'express';
import handler_reportName from '../handlers/reports-all/reportName.js';
export default Router()
    .get('/', (_request, response) => {
    const rightNow = new Date();
    response.render('report-search', {
        headTitle: 'Reports',
        todayDateString: dateTimeFns.dateToString(rightNow)
    });
})
    .all('/:reportName', handler_reportName);
