"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const configFns = require("../helpers/configFns");
describe("configFns", () => {
    describe("#getProperty", () => {
        it("Includes string value for property \"parkingTickets.ticketNumber.fieldLabel\"", () => {
            assert(typeof configFns.getProperty("parkingTickets.ticketNumber.fieldLabel"), "string");
        });
        it("Includes function value for property \"parkingTickets.ticketNumber.nextTicketNumberFn\"", () => {
            assert(typeof configFns.getProperty("parkingTickets.ticketNumber.fieldLabel"), "function");
        });
    });
    describe("#getParkingTicketStatus()", () => {
        it("Includes record = \"paid\"", () => {
            assert.ok(configFns.getParkingTicketStatus("paid"));
        });
    });
    describe("#getLicencePlateLocationProperties()", () => {
        it("Includes record = \"CA\", \"ON\"", () => {
            assert.equal(configFns.getLicencePlateLocationProperties("CA", "ON").licencePlateProvinceAlias, "Ontario");
        });
    });
});
