/* eslint-disable unicorn/filename-case, eslint-comments/disable-enable-pair */

import { type RequestHandler, Router } from 'express'

import {
  updateOrOperatorGetHandler,
  updateOrOperatorPostHandler,
  updatePostHandler
} from '../handlers/permissions.js'
import handler_mtoExport from '../handlers/plates-ontario-get/mtoExport.js'
import handler_mtoExportDownload from '../handlers/plates-ontario-get/mtoExportDownload.js'
import handler_mtoImport from '../handlers/plates-ontario-get/mtoImport.js'
import handler_doGetTicketsAvailableForMTOLookup from '../handlers/plates-ontario-post/doGetTicketsAvailableForMTOLookup.js'
import * as handler_doMTOImportUpload from '../handlers/plates-ontario-post/doMTOImportUpload.js'

export const router = Router()

router.get('/mtoExport', updateOrOperatorGetHandler, handler_mtoExport).post(
  // eslint-disable-next-line no-secrets/no-secrets
  '/doGetParkingTicketsAvailableForMTOLookup',
  updatePostHandler,
  handler_doGetTicketsAvailableForMTOLookup
)

router.get(
  '/mtoExport/:batchId',
  updateOrOperatorGetHandler,
  handler_mtoExportDownload
)

router
  .get('/mtoImport', updateOrOperatorGetHandler, handler_mtoImport)
  .post(
    '/doMTOImportUpload',
    updateOrOperatorPostHandler,
    handler_doMTOImportUpload.uploadHandler,
    handler_doMTOImportUpload.handler as RequestHandler
  )

export default router
