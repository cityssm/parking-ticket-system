import type { Request, Response } from 'express'

import createParkingTicketRemark from '../../database/parkingDB/createParkingTicketRemark.js'
import getParkingTicketRemarks from '../../database/parkingDB/getParkingTicketRemarks.js'
import type { ParkingTicketRemark } from '../../types/recordTypes.js'

export interface DoAddRemarkReturn {
  remarkIndex: number
  remarks: ParkingTicketRemark[]
}

export default function handler(request: Request, response: Response): void {
  const remarkIndex = createParkingTicketRemark(
    request.body as ParkingTicketRemark,
    request.session.user as PTSUser
  )

  const remarks = getParkingTicketRemarks(
    Number.parseInt(request.body.ticketId as string, 10),
    request.session.user as PTSUser
  )

  const json: DoAddRemarkReturn = {
    remarkIndex,
    remarks
  }

  response.json(json)
}
