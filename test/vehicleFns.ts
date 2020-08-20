import * as assert from "assert";

import * as vehicleFns from "../helpers/vehicleFns";


describe("helpers/vehicleFns", () => {

  describe("#getMakeFromNCIC", () => {
    it("should convert \"CHEV\" to \"Chevrolet\"", () => {
      assert.equal(vehicleFns.getMakeFromNCIC("CHEV"), "Chevrolet");
    });
  });

  describe("#getModelsByMake", () => {
    it("should return results for \"Ford\"", (done) => {
      vehicleFns.getModelsByMake("Ford", (results) => {
        assert.ok(results);
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