import { Router } from 'express';
import { updateOrOperatorGetHandler, updatePostHandler } from '../handlers/permissions.js';
import handler_convict from '../handlers/tickets-ontario-get/convict.js';
import handler_doAddAllTicketsToConvictionBatch from '../handlers/tickets-ontario-post/doAddAllTicketsToConvictionBatch.js';
import handler_doClearConvictionBatch from '../handlers/tickets-ontario-post/doClearConvictionBatch.js';
import handler_doRemoveTicketFromConvictionBatch from '../handlers/tickets-ontario-post/doRemoveTicketFromConvictionBatch.js';
export const router = Router();
router
    .get('/convict', updateOrOperatorGetHandler, handler_convict)
    .post('/doAddAllTicketsToConvictionBatch', updatePostHandler, handler_doAddAllTicketsToConvictionBatch)
    .post('/doClearConvictionBatch', updatePostHandler, handler_doClearConvictionBatch)
    .post('/doRemoveTicketFromConvictionBatch', updatePostHandler, handler_doRemoveTicketFromConvictionBatch);
export default router;
