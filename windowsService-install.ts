/* eslint-disable unicorn/filename-case, eslint-comments/disable-enable-pair */

// eslint-disable-next-line import/no-unresolved, n/no-missing-import
import { Service } from 'node-windows'

import { windowsServiceConfig } from './windowsService.js'

// Create a new service object
const svc = new Service(windowsServiceConfig)

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', () => {
  console.log('Install complete.')
  console.log('Service exists:', svc.exists)
  svc.start()
})

svc.install()
