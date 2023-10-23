/* eslint-disable unicorn/filename-case, eslint-comments/disable-enable-pair */

import path from 'node:path'

import { Service } from 'node-windows'

// Create a new service object
const svc = new Service({
  name: 'Parking Ticket System',
  description:
    'A system for managing parking tickets tracked by municipalities.',
  script: path.join('bin', 'www.js')
})

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', () => {
  svc.start()
})

svc.install()
