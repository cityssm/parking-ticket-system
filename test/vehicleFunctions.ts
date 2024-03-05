import assert from 'node:assert'

import * as vehicleFunctions from '../helpers/functions.vehicle.js'

describe('helpers/vehicleFunctions', () => {
  describe('#getMakeFromNCIC', () => {
    it('should convert "CHEV" to "Chevrolet"', async () => {
      const make = await vehicleFunctions.getMakeFromNCIC('CHEV')
      assert.strictEqual(make.toLowerCase(), 'chevrolet')
    })
  })

  describe('#getModelsByMakeFromCache', () => {
    it('should return results for "Ford"', () => {
      assert.ok(vehicleFunctions.getModelsByMakeFromCache('Ford'))
    })
  })

  describe('#getModelsByMake', () => {
    it('should return results for "Chevrolet"', async () => {
      const makeModelResults = await vehicleFunctions.getModelsByMake(
        'Chevrolet'
      )
      assert.notEqual(makeModelResults.length, 0)
    }).timeout(60_000)
  })

  describe('#isNCICExclusivelyTrailer', () => {
    it('should return true for "JACK" (JACK\'S TRAILER MFG.)', async () => {
      assert.strictEqual(
        await vehicleFunctions.isNCICExclusivelyTrailer('JACK'),
        true
      )
    })

    it('should return false for "BOMB" (Bombardier)', async () => {
      assert.strictEqual(
        await vehicleFunctions.isNCICExclusivelyTrailer('BOMB'),
        false
      )
    })
  })
})
