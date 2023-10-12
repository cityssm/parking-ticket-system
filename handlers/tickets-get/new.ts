import type { RequestHandler } from 'express'

import * as configFunctions from '../../helpers/functions.config.js'
import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'

import { getRecentParkingTicketVehicleMakeModelValues } from '../../database/parkingDB.js'

export const handler: RequestHandler = (request, response) => {
  const ticketNumber = request.params.ticketNumber

  const vehicleMakeModelDatalist =
    getRecentParkingTicketVehicleMakeModelValues()

  return response.render('ticket-edit', {
    headTitle: 'New Ticket',
    isCreate: true,
    ticket: {
      ticketNumber,
      licencePlateCountry: configFunctions.getProperty('defaults.country'),
      licencePlateProvince: configFunctions.getProperty('defaults.province')
    },
    issueDateMaxString: dateTimeFns.dateToString(new Date()),
    vehicleMakeModelDatalist
  })
}

export default handler
