import type { RequestHandler } from 'express'
import multer from 'multer'

import { importLicencePlateOwnership } from '../../helpers/functions.mto.js'

const storage = multer.memoryStorage()
const upload = multer({ storage })

export const uploadHandler = upload.single('importFile')

export const handler: RequestHandler = (request, response) => {
  const batchId = request.body.batchId as string

  const ownershipData = request.file?.buffer.toString() ?? ''

  const results = importLicencePlateOwnership(
    Number.parseInt(batchId, 10),
    ownershipData,
    request.session.user as PTSUser
  )

  return response.json(results)
}

export default handler
