import type { Request, Response } from 'express'
import multer from 'multer'

import { importLicencePlateOwnership } from '../../helpers/functions.mto.js'

const storage = multer.memoryStorage()
const upload = multer({ storage })

export const uploadHandler = upload.single('importFile')

export async function handler(request: Request, response: Response): Promise<void> {
  const batchId = request.body.batchId as string

  const ownershipData = request.file?.buffer.toString() ?? ''

  const results = await importLicencePlateOwnership(
    Number.parseInt(batchId, 10),
    ownershipData,
    request.session.user as PTSUser
  )

  response.json(results)
}

export default handler
