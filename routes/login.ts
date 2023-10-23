import Debug from 'debug'
import {
  Router,
  type Request,
  type Response,
  type RequestHandler
} from 'express'

import { useTestDatabases } from '../data/databasePaths.js'
import * as authenticationFunctions from '../helpers/functions.authentication.js'
import * as configFunctions from '../helpers/functions.config.js'

const debug = Debug('parking-ticket-system:login')

export const router = Router()

function getSafeRedirectURL(possibleRedirectURL = ''): string {
  switch (possibleRedirectURL) {
    case '/tickets':
    case '/tickets/new':
    case '/tickets/reconcile':
    case '/tickets-ontario/convict':
    case '/plates':
    case '/plates-ontario/mtoExport':
    case '/plates-ontario/mtoImport':
    case '/reports':
    case '/admin/cleanup':
    case '/admin/offences':
    case '/admin/locations':
    case '/admin/bylaws': {
      return possibleRedirectURL
    }
  }

  return '/dashboard'
}

async function postHandler(
  request: Request,
  response: Response
): Promise<void> {
  const userName = request.body.userName as string
  const passwordPlain = request.body.password as string

  const redirectURL = getSafeRedirectURL(request.body.redirect)

  let isAuthenticated = false

  if (userName.charAt(0) === '*') {
    if (useTestDatabases && userName === passwordPlain) {
      isAuthenticated = configFunctions
        .getProperty('users.testing')
        .includes(userName)

      if (isAuthenticated) {
        debug(`Authenticated testing user: ${userName}`)
      }
    }
  } else {
    isAuthenticated = await authenticationFunctions.authenticate(
      userName,
      passwordPlain
    )
  }

  let userObject: PTSUser | undefined

  if (isAuthenticated) {
    const userNameLowerCase = userName.toLowerCase()

    const canLogin = configFunctions
      .getProperty('users.canLogin')
      .some((currentUserName) => {
        return userNameLowerCase === currentUserName.toLowerCase()
      })

    if (canLogin) {
      const canUpdate = configFunctions
        .getProperty('users.canUpdate')
        .some((currentUserName) => {
          return userNameLowerCase === currentUserName.toLowerCase()
        })

      const isAdmin = configFunctions
        .getProperty('users.isAdmin')
        .some((currentUserName) => {
          return userNameLowerCase === currentUserName.toLowerCase()
        })

      const isOperator = configFunctions
        .getProperty('users.isOperator')
        .some((currentUserName) => {
          return userNameLowerCase === currentUserName.toLowerCase()
        })

      userObject = {
        userName: userNameLowerCase,
        canUpdate,
        isAdmin,
        isOperator
      }
    }
  }

  if (isAuthenticated && userObject !== undefined) {
    request.session.user = userObject

    response.redirect(redirectURL)
  } else {
    response.render('login', {
      userName,
      message: 'Login Failed',
      redirect: redirectURL,
      useTestDatabases
    })
  }
}

router
  .route('/')
  .get((request, response) => {
    const sessionCookieName = configFunctions.getProperty('session.cookieName')

    if (request.session.user && request.cookies[sessionCookieName]) {
      const redirectURL = getSafeRedirectURL(
        (request.query.redirect ?? '') as string
      )

      response.redirect(redirectURL)
    } else {
      response.render('login', {
        userName: '',
        message: '',
        redirect: request.query.redirect,
        useTestDatabases
      })
    }
  })
  .post(postHandler as RequestHandler)

export default router
