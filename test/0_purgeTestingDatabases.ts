/* eslint-disable unicorn/filename-case, eslint-comments/disable-enable-pair */

import * as assert from 'node:assert'
import { unlink } from 'node:fs'

import { parkingDB_testing, nhtsaDB_testing } from '../data/databasePaths.js'
import { initNHTSADB } from '../database/nhtsaDB/initializeDatabase.js'
import { initializeDatabase as initializeParkingDatabase } from '../database/parkingDB/initializeDatabase.js'

describe('Reinitialize ' + parkingDB_testing, () => {
  it('Purges ' + parkingDB_testing, (done) => {
    unlink(parkingDB_testing, (error) => {
      if (error) {
        assert.fail()
      } else {
        assert.ok(true)
      }
      done()
    })
  })

  it('Creates ' + parkingDB_testing, () => {
    const success = initializeParkingDatabase()
    assert.ok(success)
  })
})

describe('Reinitialize ' + nhtsaDB_testing, () => {
  it('Purges ' + nhtsaDB_testing, (done) => {
    unlink(nhtsaDB_testing, (error) => {
      if (error) {
        assert.fail()
      } else {
        assert.ok(true)
      }
      done()
    })
  })

  it('Creates ' + nhtsaDB_testing, () => {
    const success = initNHTSADB()
    assert.ok(success)
  })
})
