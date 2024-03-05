import type { Request, Response } from 'express'

import { getModelsByMakeFromCache } from '../../helpers/functions.vehicle.js'

export default function handler(request: Request, response: Response): void {
  const makeModelList = getModelsByMakeFromCache(
    request.body.vehicleMake as string
  )

  response.json(makeModelList)
}
