import { testAdmin } from "../../test/_globals.js";

import { logout, login } from "../support/index.js";


describe("Admin User", () => {

  before(logout);

  after(logout);

  it("Logs In Successfully", () => {
    login(testAdmin)
  });

  describe("Admin - Database Cleanup", () => {
    before(() => {
      cy.visit("/admin/cleanup");
    });

    it("Loads page", () => {
      cy.location("pathname").should("equal", "/admin/cleanup");
    });
  });

  describe("Admin - Parking Offences", () => {
    before(() => {
      cy.visit("/admin/offences");
    });

    it("Loads page", () => {
      cy.location("pathname").should("equal", "/admin/offences");
    });
  });

  describe("Admin - Parking Locations", () => {
    before(() => {
      cy.visit("/admin/locations");
    });

    it("Loads page", () => {
      cy.location("pathname").should("equal", "/admin/locations");
    });
  });

  describe("Admin - Parking By-Laws", () => {
    before(() => {
      cy.visit("/admin/bylaws");
    });

    it("Loads page", () => {
      cy.location("pathname").should("equal", "/admin/bylaws");
    });
  });
});
