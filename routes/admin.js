import { Router } from 'express';
import handler_bylaws from '../handlers/admin-get/bylaws.js';
import handler_cleanup from '../handlers/admin-get/cleanup.js';
import handler_locations from '../handlers/admin-get/locations.js';
import handler_offences from '../handlers/admin-get/offences.js';
import handler_doAddBylaw from '../handlers/admin-post/doAddBylaw.js';
import handler_doAddLocation from '../handlers/admin-post/doAddLocation.js';
import handler_doAddOffence from '../handlers/admin-post/doAddOffence.js';
import handler_doCleanupTable from '../handlers/admin-post/doCleanupTable.js';
import handler_doDeleteBylaw from '../handlers/admin-post/doDeleteBylaw.js';
import handler_doDeleteLocation from '../handlers/admin-post/doDeleteLocation.js';
import handler_doDeleteOffence from '../handlers/admin-post/doDeleteOffence.js';
import handler_doUpdateBylaw from '../handlers/admin-post/doUpdateBylaw.js';
import handler_doUpdateLocation from '../handlers/admin-post/doUpdateLocation.js';
import handler_doUpdateOffence from '../handlers/admin-post/doUpdateOffence.js';
import handler_doUpdateOffencesByBylaw from '../handlers/admin-post/doUpdateOffencesByBylaw.js';
import { adminGetHandler, adminPostHandler } from '../handlers/permissions.js';
export const router = Router();
router
    .get('/cleanup', adminGetHandler, handler_cleanup)
    .post('/doCleanupTable', adminPostHandler, handler_doCleanupTable);
router
    .get('/offences', adminGetHandler, handler_offences)
    .post('/doAddOffence', adminPostHandler, handler_doAddOffence)
    .post('/doUpdateOffence', adminPostHandler, handler_doUpdateOffence)
    .post('/doDeleteOffence', adminPostHandler, handler_doDeleteOffence);
router
    .get('/locations', adminGetHandler, handler_locations)
    .post('/doAddLocation', adminPostHandler, handler_doAddLocation)
    .post('/doUpdateLocation', adminPostHandler, handler_doUpdateLocation)
    .post('/doDeleteLocation', adminPostHandler, handler_doDeleteLocation);
router
    .get('/bylaws', adminGetHandler, handler_bylaws)
    .post('/doAddBylaw', adminPostHandler, handler_doAddBylaw)
    .post('/doUpdateBylaw', adminPostHandler, handler_doUpdateBylaw)
    .post('/doUpdateOffencesByBylaw', adminPostHandler, handler_doUpdateOffencesByBylaw)
    .post('/doDeleteBylaw', adminPostHandler, handler_doDeleteBylaw);
export default router;
