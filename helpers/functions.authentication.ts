import ActiveDirectory from 'activedirectory2'

import { getConfigProperty } from './functions.config.js'

const userDomain = getConfigProperty('application.userDomain')

const activeDirectoryConfig = getConfigProperty('activeDirectory')

const authenticateViaActiveDirectory = async (
  userName: string,
  password: string
): Promise<boolean> => {
  return await new Promise((resolve) => {
    try {
      const ad = new ActiveDirectory(activeDirectoryConfig)

      ad.authenticate(
        `${userDomain}\\${userName}`,
        password,
        async (error, auth) => {
          if (error) {
            resolve(false)
          }

          resolve(auth)
        }
      )
    } catch {
      resolve(false)
    }
  })
}

export const authenticate = async (
  userName: string,
  password: string
): Promise<boolean> => {
  if ((userName ?? '') === '' || (password ?? '') === '') {
    return false
  }

  return await authenticateViaActiveDirectory(userName, password)
}

const safeRedirects = new Set([
  '/tickets',
  '/tickets/new',
  '/tickets/reconcile',
  '/tickets-ontario/convict',
  '/plates',
  '/plates-ontario/mtoExport',
  '/plates-ontario/mtoImport',
  '/reports',
  '/admin/cleanup',
  '/admin/offences',
  '/admin/locations',
  '/admin/bylaws'
])

export function getSafeRedirectURL(possibleRedirectURL = ''): string {
  const urlPrefix = getConfigProperty('reverseProxy.urlPrefix')

  if (typeof possibleRedirectURL === 'string') {
    const urlToCheck = possibleRedirectURL.startsWith(urlPrefix)
      ? possibleRedirectURL.slice(urlPrefix.length)
      : possibleRedirectURL

    const urlToCheckLowerCase = urlToCheck.toLowerCase()

    if (safeRedirects.has(urlToCheckLowerCase)) {
      return urlPrefix + urlToCheck
    }
  }

  return `${urlPrefix}/dashboard/`
}
