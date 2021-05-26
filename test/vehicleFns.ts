import * as assert from "assert";

import * as vehicleFns from "../helpers/vehicleFns.js";


describe("helpers/vehicleFns", () => {

  describe("#getMakeFromNCIC", () => {
    it("should convert \"CHEV\" to \"Chevrolet\"", () => {
      assert.equal(vehicleFns.getMakeFromNCIC("CHEV"), "Chevrolet");
    });
  });

  describe("#getModelsByMakeFromCache", () => {
    it("should return results for \"Ford\"", () => {
      assert.ok(vehicleFns.getModelsByMakeFromCache("Ford"));
    });
  });

  describe("#getModelsByMake", () => {
    it("should return results for \"Chevrolet\"", (done) => {
      vehicleFns.getModelsByMake("Chevrolet", (makeModelResults) => {
        assert.notEqual(makeModelResults.length, 0);
        done();
      });
    });
  });

  describe("#isNCICExclusivelyTrailer", () => {

    it("should return true for \"USCA\" (U.S. Cargo Inc.)", () => {
      assert.equal(vehicleFns.isNCICExclusivelyTrailer("USCA"), true);
    });

    it("should return false for \"BOMB\" (Bombardier)", () => {
      assert.equal(vehicleFns.isNCICExclusivelyTrailer("BOMB"), false);
    });
  });
});
