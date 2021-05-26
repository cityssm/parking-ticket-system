import * as assert from "assert";

import * as configFns from "../helpers/configFns.js";


describe("helpers/configFns", () => {

  describe("#getProperty", () => {
    it("should include string value for property \"parkingTickets.ticketNumber.fieldLabel\"", () => {
      assert.equal(typeof configFns.getProperty("parkingTickets.ticketNumber.fieldLabel"), "string");
    });

    it("should return a string from function property \"parkingTickets.ticketNumber.nextTicketNumberFn\"", () => {
      assert.equal(typeof configFns.getProperty("parkingTickets.ticketNumber.nextTicketNumberFn")(""), "string");
    });


  });

  describe("#getParkingTicketStatus()", () => {
    it("should include a ticket status \"paid\"", () => {
      assert.ok(configFns.getParkingTicketStatus("paid"));
    });
  });

  describe("#getLicencePlateLocationProperties()", () => {
    it("should include the location \"CA\", \"ON\"", () => {
      assert.equal(configFns.getLicencePlateLocationProperties("CA", "ON").licencePlateProvinceAlias, "Ontario");
    });
  });
});
