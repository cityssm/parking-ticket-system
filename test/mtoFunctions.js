import * as assert from "assert";
import * as mtoFunctions from "../helpers/functions.mto.js";
describe("helpers/mtoFunctions", () => {
    const currentDate = new Date();
    describe("#twoDigitYearToFourDigit()", () => {
        const currentYear = currentDate.getFullYear();
        const currentYearTwoDigits = currentYear % 100;
        it("(" + currentYearTwoDigits.toString() + ") => " + currentYear.toString(), () => {
            assert.strictEqual(mtoFunctions.twoDigitYearToFourDigit(currentYearTwoDigits), currentYear);
        });
        const futureYear = currentYear + 5;
        const futureYearTwoDigits = futureYear % 100;
        it("should convert " + futureYearTwoDigits.toString() + " to " + futureYear.toString(), () => {
            assert.strictEqual(mtoFunctions.twoDigitYearToFourDigit(futureYearTwoDigits), futureYear);
        });
        const pastYear = (currentYear + 15) - 100;
        const pastYearTwoDigits = pastYear % 100;
        it("should convert " + pastYearTwoDigits.toString() + " to " + pastYear.toString(), () => {
            assert.strictEqual(mtoFunctions.twoDigitYearToFourDigit(pastYearTwoDigits), pastYear);
        });
    });
    describe("#sixDigitDateNumberToEightDigit()", () => {
        const currentDateEightDigits = (currentDate.getFullYear() * 10000) +
            ((currentDate.getMonth() + 1) * 100) +
            currentDate.getDate();
        const currentDateSixDigits = Number.parseInt(currentDateEightDigits.toString().slice(-6), 10);
        it("should convert " + currentDateSixDigits.toString() + " to " + currentDateEightDigits.toString(), () => {
            assert.strictEqual(mtoFunctions.sixDigitDateNumberToEightDigit(currentDateSixDigits), currentDateEightDigits);
        });
    });
    describe("#parsePKRD()", () => {
        describe("valid PKRD string", () => {
            const validString = "PKRDSAMPLE    200102TKT123      xxxxxxxxxxxxxxx700101MDOE,JOHN/DOE,JANE                                 1234 FAKE ST,SAULT STE MARIE            A1A1A1CHEV19130000  KMBLK                                   2101                         ";
            const parsed = mtoFunctions.parsePKRD(validString);
            it("should have licencePlateNumber = \"SAMPLE\"", () => {
                if (parsed) {
                    assert.strictEqual(parsed.licencePlateNumber, "SAMPLE");
                }
                else {
                    assert.fail();
                }
            });
            it("should have ticketNumber = \"TKT123\"", () => {
                if (parsed) {
                    assert.strictEqual(parsed.ticketNumber, "TKT123");
                }
                else {
                    assert.fail();
                }
            });
            it("should have vehicleNCIC = \"CHEV\"", () => {
                if (parsed) {
                    assert.strictEqual(parsed.vehicleNCIC, "CHEV");
                }
                else {
                    assert.fail();
                }
            });
        });
        describe("invalid PKRD string", () => {
            it("returns false", () => {
                assert.strictEqual(mtoFunctions.parsePKRD(""), false);
            });
        });
    });
});
