/* eslint-disable unicorn/filename-case, eslint-comments/disable-enable-pair */

import * as assert from 'node:assert'
import { exec } from 'node:child_process'
import * as http from 'node:http'

import { app } from '../app.js'

import { portNumber } from './_globals.js'

describe('parking-ticket-system', () => {
  const httpServer = http.createServer(app)

  let serverStarted = false

  before(async () => {
    httpServer.listen(portNumber)

    httpServer.on('listening', () => {
      serverStarted = true
    })
  })

  after(() => {
    try {
      httpServer.close()
    } catch {
      // ignore
    }
  })

  it('should start server starts on port ' + portNumber.toString(), () => {
    assert.ok(serverStarted)
  })

  describe('Cypress tests', () => {
    it('should run Cypress tests', (done) => {
      let cypresssCommand =
        'cypress run --config-file cypress.config.ts --browser chrome'

      if ((process.env.CYPRESS_RECORD_KEY ?? '') !== '') {
        cypresssCommand += ' --record'
      }

      const childProcess = exec(cypresssCommand)

      childProcess.stdout?.on('data', (data) => {
        console.log(data)
      })

      childProcess.stderr?.on('data', (data) => {
        console.error(data)
      })

      childProcess.on('exit', (code) => {
        assert.ok(code === 0)
        done()
      })
    }).timeout(30 * 60 * 60 * 1000)
  })
})
