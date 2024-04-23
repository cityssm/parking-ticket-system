import cluster from 'node:cluster'

import Debug from 'debug'

import getParkingBylawsFromDatabase from '../database/parkingDB/getParkingBylaws.js'
import getParkingLocationsFromDatabase from '../database/parkingDB/getParkingLocations.js'
import type {
  CacheTableName,
  ClearCacheWorkerMessage
} from '../types/applicationTypes.js'
import type { ParkingBylaw, ParkingLocation } from '../types/recordTypes.js'

const debug = Debug(`parking-ticket-system:functions.cache:${process.pid}`)

/*
 * Parking Bylaws
 */

let parkingBylaws: ParkingBylaw[] = []

export function getParkingBylaws(): ParkingBylaw[] {
  if (parkingBylaws.length === 0) {
    debug('Cache miss: ParkingBylaws')
    parkingBylaws = getParkingBylawsFromDatabase()
  }

  return parkingBylaws
}

/*
 * Parking Locations
 */

let parkingLocations: ParkingLocation[] = []

export function getParkingLocations(): ParkingLocation[] {
  if (parkingLocations.length === 0) {
    debug('Cache miss: ParkingLocations')
    parkingLocations = getParkingLocationsFromDatabase()
  }

  return parkingLocations
}

/*
 * Clear Caches
 */

export function clearCacheByTableName(
  tableName: CacheTableName,
  relayMessage = true
): void {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (tableName) {
    case 'ParkingBylaws': {
      parkingBylaws = []
      break
    }
    case 'ParkingLocations': {
      parkingLocations = []
      break
    }
    default: {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      debug(`Ignoring clear cache for unknown table: ${tableName}`)
    }
  }

  try {
    if (relayMessage && cluster.isWorker && process.send !== undefined) {
      const workerMessage: ClearCacheWorkerMessage = {
        messageType: 'clearCache',
        tableName,
        timeMillis: Date.now(),
        pid: process.pid
      }

      debug(`Sending clear cache from worker: ${tableName}`)

      process.send(workerMessage)
    }
  } catch {
    debug('Error sending clear cache message.')
  }
}

/*
 * Respond to messaging
 */

process.on('message', (message: ClearCacheWorkerMessage) => {
  if (message.messageType === 'clearCache' && message.pid !== process.pid) {
    debug(`Clearing cache: ${message.tableName}`)
    clearCacheByTableName(message.tableName, false)
  }
})
