import { type RequestHandler, Router } from 'express'

import {
  updateGetHandler,
  updateOrOperatorGetHandler,
  updateOrOperatorPostHandler,
  updatePostHandler
} from '../handlers/permissions.js'
import handler_byTicketNumber from '../handlers/tickets-get/byTicketNumber.js'
import handler_convictPrint from '../handlers/tickets-get/convictPrint.js'
import handler_edit from '../handlers/tickets-get/edit.js'
import handler_new from '../handlers/tickets-get/new.js'
import handler_print from '../handlers/tickets-get/print.js'
import handler_reconcile from '../handlers/tickets-get/reconcile.js'
import handler_view from '../handlers/tickets-get/view.js'
import handler_doAcknowledgeLookupError from '../handlers/tickets-post/doAcknowledgeLookupError.js'
import handler_doAddRemark from '../handlers/tickets-post/doAddRemark.js'
import handler_doAddStatus from '../handlers/tickets-post/doAddStatus.js'
import handler_doAddTicketToConvictionBatch from '../handlers/tickets-post/doAddTicketToConvictionBatch.js'
import handler_doCreateConvictionBatch from '../handlers/tickets-post/doCreateConvictionBatch.js'
import handler_doCreateTicket from '../handlers/tickets-post/doCreateTicket.js'
import handler_doDeleteRemark from '../handlers/tickets-post/doDeleteRemark.js'
import handler_doDeleteStatus from '../handlers/tickets-post/doDeleteStatus.js'
import handler_doDeleteTicket from '../handlers/tickets-post/doDeleteTicket.js'
import handler_doGetConvictionBatch from '../handlers/tickets-post/doGetConvictionBatch.js'
import handler_doGetRecentConvictionBatches from '../handlers/tickets-post/doGetRecentConvictionBatches.js'
import handler_doGetRemarks from '../handlers/tickets-post/doGetRemarks.js'
import handler_doGetStatuses from '../handlers/tickets-post/doGetStatuses.js'
import handler_doGetTickets from '../handlers/tickets-post/doGetTickets.js'
import handler_doLockConvictionBatch from '../handlers/tickets-post/doLockConvictionBatch.js'
import handler_doMarkConvictionBatchSent from '../handlers/tickets-post/doMarkConvictionBatchSent.js'
import handler_doQuickReconcileMatches from '../handlers/tickets-post/doQuickReconcileMatches.js'
import handler_doReconcileAsError from '../handlers/tickets-post/doReconcileAsError.js'
import handler_doReconcileAsMatch from '../handlers/tickets-post/doReconcileAsMatch.js'
import handler_doResolveTicket from '../handlers/tickets-post/doResolveTicket.js'
import handler_doRestoreTicket from '../handlers/tickets-post/doRestoreTicket.js'
import handler_doUnlockConvictionBatch from '../handlers/tickets-post/doUnlockConvictionBatch.js'
import handler_doUnresolveTicket from '../handlers/tickets-post/doUnresolveTicket.js'
import handler_doUpdateRemark from '../handlers/tickets-post/doUpdateRemark.js'
import handler_doUpdateStatus from '../handlers/tickets-post/doUpdateStatus.js'
import handler_doUpdateTicket from '../handlers/tickets-post/doUpdateTicket.js'

export const router = Router()

/*
 * Ticket Search
 */

router.get('/', (_request, response) => {
  response.render('ticket-search', {
    headTitle: 'Parking Tickets'
  })
})

router.post('/doGetTickets', handler_doGetTickets)

/*
 * Ownership Reconciliation
 */

router.get('/reconcile', updateGetHandler, handler_reconcile as RequestHandler)

router.post(
  '/doAcknowledgeLookupError',
  updatePostHandler,
  handler_doAcknowledgeLookupError
)

router.post(
  '/doReconcileAsMatch',
  updatePostHandler,
  handler_doReconcileAsMatch as RequestHandler
)

router.post(
  '/doReconcileAsError',
  updatePostHandler,
  handler_doReconcileAsError as RequestHandler
)

router.post(
  '/doQuickReconcileMatches',
  updatePostHandler,
  handler_doQuickReconcileMatches as RequestHandler
)

/*
 * Ticket Convictions
 */

router.post(
  '/doGetRecentConvictionBatches',
  updateOrOperatorPostHandler,
  handler_doGetRecentConvictionBatches
)

router.post(
  '/doGetConvictionBatch',
  updateOrOperatorPostHandler,
  handler_doGetConvictionBatch
)

router.post(
  '/doCreateConvictionBatch',
  updatePostHandler,
  handler_doCreateConvictionBatch
)

router.post(
  '/doAddTicketToConvictionBatch',
  updatePostHandler,
  handler_doAddTicketToConvictionBatch
)

router.post(
  '/doLockConvictionBatch',
  updatePostHandler,
  handler_doLockConvictionBatch
)

router.post(
  '/doUnlockConvictionBatch',
  updatePostHandler,
  handler_doUnlockConvictionBatch
)

/*
 * New Ticket
 */

router.get(['/new', '/new/:ticketNumber'], updateGetHandler, handler_new)

router.post('/doCreateTicket', updatePostHandler, handler_doCreateTicket)

router.post('/doUpdateTicket', updatePostHandler, handler_doUpdateTicket)

router.post('/doDeleteTicket', updatePostHandler, handler_doDeleteTicket)

router.post('/doResolveTicket', updatePostHandler, handler_doResolveTicket)

router.post('/doUnresolveTicket', updatePostHandler, handler_doUnresolveTicket)

router.post('/doRestoreTicket', updatePostHandler, handler_doRestoreTicket)

/*
 * Ticket Remarks
 */

router.post('/doGetRemarks', handler_doGetRemarks)

router.post('/doAddRemark', updatePostHandler, handler_doAddRemark)

router.post('/doUpdateRemark', updatePostHandler, handler_doUpdateRemark)

router.post('/doDeleteRemark', updatePostHandler, handler_doDeleteRemark)

/*
 * Ticket Statuses
 */

router.post('/doGetStatuses', handler_doGetStatuses)

router.post('/doAddStatus', updatePostHandler, handler_doAddStatus)

router.post('/doUpdateStatus', updatePostHandler, handler_doUpdateStatus)

router.post('/doDeleteStatus', updatePostHandler, handler_doDeleteStatus)

/*
 * Ticket View
 */

router.get('/:ticketId', handler_view as RequestHandler)

router.get('/:ticketId/print', handler_print as RequestHandler)

router.get('/byTicketNumber/:ticketNumber', handler_byTicketNumber)

/*
 * Ticket Edit
 */

router.get('/:ticketId/edit', updateGetHandler, handler_edit as RequestHandler)

/*
 * Ticket Convict
 */

router.get(
  '/convict/:batchId/print',
  updateOrOperatorGetHandler,
  handler_convictPrint
)

router.post(
  '/doMarkConvictionBatchSent',
  updateOrOperatorGetHandler,
  handler_doMarkConvictionBatchSent
)

export default router
