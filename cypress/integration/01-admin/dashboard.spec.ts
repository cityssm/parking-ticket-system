import { testAdmin } from "../../../test/_globals.js";

import { logout, login } from "../../support/index.js";

describe("Dashboard - Admin User", () => {

  before(() => {
    logout();
    login(testAdmin)
  });

  after(logout);

  beforeEach("Loads page", () => {
    cy.visit("/dashboard");
    cy.location("pathname").should("equal", "/dashboard");
  });

  it("Sets the data-is-admin attribute to true", () => {
    cy.get("main")
      .invoke("attr", "data-is-admin")
      .should("equal", "true");
  });

  it("Has a link to Database Cleanup", () => {
    cy.get("a[href*='/admin/cleanup']").should("exist");
  });

  it("Has a link to Parking Offence Maintenance", () => {
    cy.get("a[href*='/admin/offences']").should("exist");
  });

  it("Has a link to Parking Location Maintenance", () => {
    cy.get("a[href*='/admin/locations']").should("exist");
  });

  it("Has a link to Parking By-Law Maintenance", () => {
    cy.get("a[href*='/admin/bylaws']").should("exist");
  });

  it("Has no detectable accessibility issues", () => {
    cy.injectAxe();
    cy.checkA11y();
  });
});
