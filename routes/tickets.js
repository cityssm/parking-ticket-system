import { Router } from 'express';
import { updateGetHandler, updateOrOperatorGetHandler, updateOrOperatorPostHandler, updatePostHandler } from '../handlers/permissions.js';
import handler_byTicketNumber from '../handlers/tickets-get/byTicketNumber.js';
import handler_convictPrint from '../handlers/tickets-get/convictPrint.js';
import handler_edit from '../handlers/tickets-get/edit.js';
import handler_new from '../handlers/tickets-get/new.js';
import handler_print from '../handlers/tickets-get/print.js';
import handler_reconcile from '../handlers/tickets-get/reconcile.js';
import handler_view from '../handlers/tickets-get/view.js';
import handler_doAcknowledgeLookupError from '../handlers/tickets-post/doAcknowledgeLookupError.js';
import handler_doAddRemark from '../handlers/tickets-post/doAddRemark.js';
import handler_doAddStatus from '../handlers/tickets-post/doAddStatus.js';
import handler_doAddTicketToConvictionBatch from '../handlers/tickets-post/doAddTicketToConvictionBatch.js';
import handler_doCreateConvictionBatch from '../handlers/tickets-post/doCreateConvictionBatch.js';
import handler_doCreateTicket from '../handlers/tickets-post/doCreateTicket.js';
import handler_doDeleteRemark from '../handlers/tickets-post/doDeleteRemark.js';
import handler_doDeleteStatus from '../handlers/tickets-post/doDeleteStatus.js';
import handler_doDeleteTicket from '../handlers/tickets-post/doDeleteTicket.js';
import handler_doGetConvictionBatch from '../handlers/tickets-post/doGetConvictionBatch.js';
import handler_doGetRecentConvictionBatches from '../handlers/tickets-post/doGetRecentConvictionBatches.js';
import handler_doGetRemarks from '../handlers/tickets-post/doGetRemarks.js';
import handler_doGetStatuses from '../handlers/tickets-post/doGetStatuses.js';
import handler_doGetTickets from '../handlers/tickets-post/doGetTickets.js';
import handler_doLockConvictionBatch from '../handlers/tickets-post/doLockConvictionBatch.js';
import handler_doMarkConvictionBatchSent from '../handlers/tickets-post/doMarkConvictionBatchSent.js';
import handler_doQuickReconcileMatches from '../handlers/tickets-post/doQuickReconcileMatches.js';
import handler_doReconcileAsError from '../handlers/tickets-post/doReconcileAsError.js';
import handler_doReconcileAsMatch from '../handlers/tickets-post/doReconcileAsMatch.js';
import handler_doResolveTicket from '../handlers/tickets-post/doResolveTicket.js';
import handler_doRestoreTicket from '../handlers/tickets-post/doRestoreTicket.js';
import handler_doUnlockConvictionBatch from '../handlers/tickets-post/doUnlockConvictionBatch.js';
import handler_doUnresolveTicket from '../handlers/tickets-post/doUnresolveTicket.js';
import handler_doUpdateRemark from '../handlers/tickets-post/doUpdateRemark.js';
import handler_doUpdateStatus from '../handlers/tickets-post/doUpdateStatus.js';
import handler_doUpdateTicket from '../handlers/tickets-post/doUpdateTicket.js';
export const router = Router();
router
    .get('/', (_request, response) => {
    response.render('ticket-search', {
        headTitle: 'Parking Tickets'
    });
})
    .post('/doGetTickets', handler_doGetTickets);
router
    .get('/reconcile', updateGetHandler, handler_reconcile)
    .post('/doAcknowledgeLookupError', updatePostHandler, handler_doAcknowledgeLookupError)
    .post('/doReconcileAsMatch', updatePostHandler, handler_doReconcileAsMatch)
    .post('/doReconcileAsError', updatePostHandler, handler_doReconcileAsError)
    .post('/doQuickReconcileMatches', updatePostHandler, handler_doQuickReconcileMatches);
router
    .post('/doGetRecentConvictionBatches', updateOrOperatorPostHandler, handler_doGetRecentConvictionBatches)
    .post('/doGetConvictionBatch', updateOrOperatorPostHandler, handler_doGetConvictionBatch)
    .post('/doCreateConvictionBatch', updatePostHandler, handler_doCreateConvictionBatch)
    .post('/doAddTicketToConvictionBatch', updatePostHandler, handler_doAddTicketToConvictionBatch)
    .post('/doLockConvictionBatch', updatePostHandler, handler_doLockConvictionBatch)
    .post('/doUnlockConvictionBatch', updatePostHandler, handler_doUnlockConvictionBatch);
router
    .get(['/new', '/new/:ticketNumber'], updateGetHandler, handler_new)
    .post('/doCreateTicket', updatePostHandler, handler_doCreateTicket)
    .post('/doUpdateTicket', updatePostHandler, handler_doUpdateTicket)
    .post('/doDeleteTicket', updatePostHandler, handler_doDeleteTicket)
    .post('/doResolveTicket', updatePostHandler, handler_doResolveTicket)
    .post('/doUnresolveTicket', updatePostHandler, handler_doUnresolveTicket)
    .post('/doRestoreTicket', updatePostHandler, handler_doRestoreTicket);
router
    .post('/doGetRemarks', handler_doGetRemarks)
    .post('/doAddRemark', updatePostHandler, handler_doAddRemark)
    .post('/doUpdateRemark', updatePostHandler, handler_doUpdateRemark)
    .post('/doDeleteRemark', updatePostHandler, handler_doDeleteRemark);
router
    .post('/doGetStatuses', handler_doGetStatuses)
    .post('/doAddStatus', updatePostHandler, handler_doAddStatus)
    .post('/doUpdateStatus', updatePostHandler, handler_doUpdateStatus)
    .post('/doDeleteStatus', updatePostHandler, handler_doDeleteStatus);
router
    .get('/:ticketId', handler_view)
    .get('/:ticketId/print', handler_print)
    .get('/byTicketNumber/:ticketNumber', handler_byTicketNumber);
router.get('/:ticketId/edit', updateGetHandler, handler_edit);
router
    .get('/convict/:batchId/print', updateOrOperatorGetHandler, handler_convictPrint)
    .post('/doMarkConvictionBatchSent', updateOrOperatorGetHandler, handler_doMarkConvictionBatchSent);
export default router;
