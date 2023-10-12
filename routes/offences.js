import { Router } from 'express';
import handler_doGetAllLocations from '../handlers/offences-post/doGetAllLocations.js';
import handler_doGetAllOffences from '../handlers/offences-post/doGetAllOffences.js';
import handler_doGetOffencesByLocation from '../handlers/offences-post/doGetOffencesByLocation.js';
export const router = Router();
router.post('/doGetAllLocations', handler_doGetAllLocations);
router.post('/doGetOffencesByLocation', handler_doGetOffencesByLocation);
router.post('/doGetAllOffences', handler_doGetAllOffences);
export default router;
