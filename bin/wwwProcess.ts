import http from 'node:http'

import Debug from 'debug'
import exitHook from 'exit-hook'

import { app } from '../app.js'
import { getConfigProperty } from '../helpers/functions.config.js'

const debug = Debug(`parking-ticket-system:wwwProcess:${process.pid}`)

interface ServerError extends Error {
  syscall: string
  code: string
}

const onError = (error: ServerError): void => {
  if (error.syscall !== 'listen') {
    throw error
  }

  let doProcessExit = false

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES': {
      debug('Requires elevated privileges')
      doProcessExit = true
      break
    }

    case 'EADDRINUSE': {
      debug('Port is already in use.')
      doProcessExit = true
      break
    }

    default: {
      throw error
    }
  }

  if (doProcessExit) {
    // eslint-disable-next-line n/no-process-exit, unicorn/no-process-exit
    process.exit(1)
  }
}

const onListening = (server: http.Server): void => {
  const addr = server.address()

  const bind =
    typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + (addr?.port.toString() ?? '')

  debug('Listening on ' + bind)
}

/**
 * Initialize HTTP
 */

process.title = `${getConfigProperty('application.applicationName')} (Worker)`

const httpPort = getConfigProperty('application.httpPort')

const httpServer = http.createServer(app)

httpServer.listen(httpPort)

httpServer.on('error', onError)
httpServer.on('listening', () => {
  onListening(httpServer)
})

exitHook(() => {
  debug('Closing HTTP')
  httpServer.close()
})
