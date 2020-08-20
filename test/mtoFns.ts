import * as assert from "assert";

import * as mtoFns from "../helpers/mtoFns";


describe("helpers/mtoFns", () => {

  const currentDate = new Date();

  describe("#twoDigitYearToFourDigit()", () => {

    const currentYear = currentDate.getFullYear();
    const currentYearTwoDigits = currentYear % 100;

    it("(" + currentYearTwoDigits.toString() + ") => " + currentYear.toString(), () => {
      assert.equal(mtoFns.twoDigitYearToFourDigit(currentYearTwoDigits), currentYear);
    });

    // Two digit years more than 10 years in the future
    // are considered in the past.

    const futureYear = currentYear + 5;
    const futureYearTwoDigits = futureYear % 100;

    it("should convert " + futureYearTwoDigits.toString() + " to " + futureYear.toString(), () => {
      assert.equal(mtoFns.twoDigitYearToFourDigit(futureYearTwoDigits), futureYear);
    });

    const pastYear = (currentYear + 15) - 100;
    const pastYearTwoDigits = pastYear % 100;

    it("should convert " + pastYearTwoDigits.toString() + " to " + pastYear.toString(), () => {
      assert.equal(mtoFns.twoDigitYearToFourDigit(pastYearTwoDigits), pastYear);
    });

  });

  describe("#sixDigitDateNumberToEightDigit()", () => {

    const currentDateEightDigits =
      (currentDate.getFullYear() * 10000) +
      ((currentDate.getMonth() + 1) * 100) +
      currentDate.getDate();

    const currentDateSixDigits = parseInt(currentDateEightDigits.toString().slice(-6), 10);

    it("should convert " + currentDateSixDigits.toString() + " to " + currentDateEightDigits.toString(), () => {
      assert.equal(mtoFns.sixDigitDateNumberToEightDigit(currentDateSixDigits), currentDateEightDigits);
    });
  });
});
