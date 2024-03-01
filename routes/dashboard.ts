import { Router } from 'express'

import handler_doGetDefaultConfigProperties from '../handlers/dashboard-post/doGetDefaultConfigProperties.js'

export const router = Router()

router.get('/', (_request, response) => {
  response.render('dashboard', {
    headTitle: 'Dashboard'
  })
})

router.post(
  '/doGetDefaultConfigProperties',
  handler_doGetDefaultConfigProperties
)

export default router
