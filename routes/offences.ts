import { Router } from 'express'

import handler_doGetAllLocations from '../handlers/offences-post/doGetAllLocations.js'
import handler_doGetAllOffences from '../handlers/offences-post/doGetAllOffences.js'
import handler_doGetOffencesByLocation from '../handlers/offences-post/doGetOffencesByLocation.js'

export default Router()
  .post('/doGetAllLocations', handler_doGetAllLocations)
  .post('/doGetOffencesByLocation', handler_doGetOffencesByLocation)
  .post('/doGetAllOffences', handler_doGetAllOffences)
