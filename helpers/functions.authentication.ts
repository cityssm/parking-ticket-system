import ActiveDirectory from 'activedirectory2'

import * as configFunctions from './functions.config.js'

const userDomain = configFunctions.getConfigProperty('application.userDomain')

const activeDirectoryConfig = configFunctions.getConfigProperty('activeDirectory')

const authenticateViaActiveDirectory = async (
  userName: string,
  password: string
): Promise<boolean> => {
  return await new Promise((resolve) => {
    try {
      const ad = new ActiveDirectory(activeDirectoryConfig)

      ad.authenticate(
        userDomain + '\\' + userName,
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
  if (!userName || userName === '' || !password || password === '') {
    return false
  }

  return await authenticateViaActiveDirectory(userName, password)
}
