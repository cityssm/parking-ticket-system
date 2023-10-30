import path from 'node:path'

export const windowsServiceConfig = {
  name: 'Parking Ticket System',
  description:
    'A system for managing parking tickets tracked by municipalities.',
  script: path.join('bin', 'www.js')
}
