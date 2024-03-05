import type { Request, Response } from 'express'

import { getConfigProperty } from '../../helpers/functions.config.js'

export default function handler(_request: Request, response: Response): void {
  response.json({
    locationClasses: getConfigProperty('locationClasses'),
    ticketNumber_fieldLabel: getConfigProperty(
      'parkingTickets.ticketNumber.fieldLabel'
    ),
    parkingTicketStatuses: getConfigProperty('parkingTicketStatuses'),
    licencePlateCountryAliases: getConfigProperty('licencePlateCountryAliases'),
    licencePlateProvinceAliases: getConfigProperty(
      'licencePlateProvinceAliases'
    ),
    licencePlateProvinces: getConfigProperty('licencePlateProvinces')
  })
}
