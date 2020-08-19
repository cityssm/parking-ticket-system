"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const configFns = require("../helpers/configFns");
describe("configFns", () => {
    describe("#getProperty", () => {
        it("Includes string value for property \"parkingTickets.ticketNumber.fieldLabel\"", () => {
            assert.equal(typeof configFns.getProperty("parkingTickets.ticketNumber.fieldLabel"), "string");
        });
        it("Ensure function value for property \"parkingTickets.ticketNumber.nextTicketNumberFn\" returns a string", () => {
            assert.equal(typeof configFns.getProperty("parkingTickets.ticketNumber.nextTicketNumberFn")(""), "string");
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
