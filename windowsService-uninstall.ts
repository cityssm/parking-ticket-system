/* eslint-disable unicorn/filename-case, eslint-comments/disable-enable-pair */

// eslint-disable-next-line import/no-unresolved, n/no-missing-import
import { Service } from 'node-windows'

import { windowsServiceConfig } from './windowsService.js'

// Create a new service object
const svc = new Service(windowsServiceConfig)

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall', () => {
  console.log('Uninstall complete.')
  console.log('Service exists:', svc.exists)
})

// Uninstall the service.
svc.uninstall()
