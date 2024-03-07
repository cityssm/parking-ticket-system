import { type RequestHandler, Router } from 'express'

import {
  updateOrOperatorPostHandler,
  updatePostHandler
} from '../handlers/permissions.js'
import handler_view from '../handlers/plates-get/view.js'
import handler_doAddAllParkingTicketsToLookupBatch from '../handlers/plates-post/doAddAllParkingTicketsToLookupBatch.js'
import handler_doAddLicencePlateToLookupBatch from '../handlers/plates-post/doAddLicencePlateToLookupBatch.js'
import handler_doClearLookupBatch from '../handlers/plates-post/doClearLookupBatch.js'
import handler_doCreateLookupBatch from '../handlers/plates-post/doCreateLookupBatch.js'
import handler_doGetLicencePlates from '../handlers/plates-post/doGetLicencePlates.js'
import handler_doGetLookupBatch from '../handlers/plates-post/doGetLookupBatch.js'
import handler_doGetModelsByMake from '../handlers/plates-post/doGetModelsByMake.js'
import handler_doGetUnreceivedLicencePlateLookupBatches from '../handlers/plates-post/doGetUnreceivedLicencePlateLookupBatches.js'
import handler_doLockLookupBatch from '../handlers/plates-post/doLockLookupBatch.js'
import handler_doRemoveLicencePlateFromLookupBatch from '../handlers/plates-post/doRemoveLicencePlateFromLookupBatch.js'

export const router = Router()

router.get('/', (_request, response) => {
  response.render('plate-search', {
    headTitle: 'Licence Plates'
  })
})

router.post('/doGetLicencePlates', handler_doGetLicencePlates)

// Lookup Batches

router.post(
  '/doGetUnreceivedLicencePlateLookupBatches',
  updateOrOperatorPostHandler,
  handler_doGetUnreceivedLicencePlateLookupBatches
)

router.post(
  '/doCreateLookupBatch',
  updatePostHandler,
  handler_doCreateLookupBatch
)

router.post(
  '/doGetLookupBatch',
  updateOrOperatorPostHandler,
  handler_doGetLookupBatch
)

router.post(
  '/doAddLicencePlateToLookupBatch',
  updatePostHandler,
  handler_doAddLicencePlateToLookupBatch
)

router.post(
  '/doAddAllParkingTicketsToLookupBatch',
  updatePostHandler,
  handler_doAddAllParkingTicketsToLookupBatch
)

router.post(
  '/doRemoveLicencePlateFromLookupBatch',
  updatePostHandler,
  handler_doRemoveLicencePlateFromLookupBatch
)

router.post(
  '/doClearLookupBatch',
  updatePostHandler,
  handler_doClearLookupBatch
)

router.post('/doLockLookupBatch', updatePostHandler, handler_doLockLookupBatch)

router.post('/doGetModelsByMake', handler_doGetModelsByMake)

// View

router.get(
  '/:licencePlateCountry/:licencePlateProvince/:licencePlateNumber',
  handler_view as RequestHandler
)

export default router
