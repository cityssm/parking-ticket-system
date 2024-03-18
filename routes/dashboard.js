import { Router } from 'express';
import handler_doGetDefaultConfigProperties from '../handlers/dashboard-post/doGetDefaultConfigProperties.js';
export default Router()
    .get('/', (_request, response) => {
    response.render('dashboard', {
        headTitle: 'Dashboard'
    });
})
    .post('/doGetDefaultConfigProperties', handler_doGetDefaultConfigProperties);
