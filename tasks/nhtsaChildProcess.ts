import { dateToInteger } from '@cityssm/utils-datetime'
import Debug from 'debug'
import exitHook from 'exit-hook'
import {
  type SetIntervalAsyncTimer,
  clearIntervalAsync,
  setIntervalAsync
} from 'set-interval-async'

import { getDistinctLicencePlateOwnerVehicleNCICs } from '../database/parkingDB.js'
import { getConfigProperty } from '../helpers/functions.config.js'
import {
  getMakeFromNCIC,
  getModelsByMake
} from '../helpers/functions.vehicle.js'

const debug = Debug('parking-ticket-system:task:nhtsaChildProcess')

const initDate = new Date()
initDate.setMonth(initDate.getMonth() - 1)

let cutoffDate = dateToInteger(initDate) as number

let terminateTask = false

async function doTask(): Promise<void> {
  const vehicleNCICs = getDistinctLicencePlateOwnerVehicleNCICs(cutoffDate)

  for (const ncicRecord of vehicleNCICs) {
    if (terminateTask) {
      break
    }

    cutoffDate = ncicRecord.recordDateMax

    const vehicleMake = await getMakeFromNCIC(ncicRecord.vehicleNCIC)

    debug(`Processing ${vehicleMake}`)

    await getModelsByMake(vehicleMake)
  }
}

let timeoutId: NodeJS.Timeout
let intervalId: SetIntervalAsyncTimer<[]>

export async function scheduleRun(): Promise<void> {
  const firstScheduleDate = new Date()

  firstScheduleDate.setHours(
    getConfigProperty('application.task_nhtsa.executeHour')
  )
  firstScheduleDate.setDate(firstScheduleDate.getDate() + 1)

  debug(`NHTSA task scheduled for ${firstScheduleDate.toString()}`)

  timeoutId = setTimeout(() => {
    if (terminateTask) {
      return
    }

    debug('NHTSA task starting')

    intervalId = setIntervalAsync(doTask, 86_400 * 1000)

    void doTask()
  }, firstScheduleDate.getTime() - Date.now())
}

await scheduleRun()

exitHook(() => {
  terminateTask = true
  debug('Exit hook called')

  try {
    clearTimeout(timeoutId)
    debug('Timeout cleared')
  } catch {
    // ignore
  }

  try {
    void clearIntervalAsync(intervalId)
    debug('Interval cleared')
  } catch {
    // ignore
  }
})
