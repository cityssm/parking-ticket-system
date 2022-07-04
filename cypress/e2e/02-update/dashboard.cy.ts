import { testUpdate } from "../../../test/_globals.js";

import { logout, login } from "../../support/index.js";

describe("Dashboard - Update User", () => {

  before(() => {
    logout();
    login(testUpdate)
  });

  after(logout);

  beforeEach("Loads page", () => {
    cy.visit("/dashboard");
    cy.location("pathname").should("equal", "/dashboard");
  });

  it("Has no detectable accessibility issues", () => {
    cy.injectAxe();
    cy.checkA11y();
  });

  it("Sets the data-can-update attribute to true", () => {
    cy.get("main")
      .invoke("attr", "data-can-update")
      .should("equal", "true");
  });

  it("Sets the data-is-admin attribute to false", () => {
    cy.get("main")
      .invoke("attr", "data-is-admin")
      .should("equal", "false");
  });

  it("Has a link to create a new ticket", () => {
    cy.get("a[href*='/tickets/new']").should("exist");
  });

  it("Does not have a link to Database Cleanup", () => {
    cy.get("a[href*='/admin/cleanup']").should("not.exist");
  });

  it("Does not have a link to Parking Offence Maintenance", () => {
    cy.get("a[href*='/admin/offences']").should("not.exist");
  });

  it("Does not have a link to Parking Location Maintenance", () => {
    cy.get("a[href*='/admin/locations']").should("not.exist");
  });

  it("Does not have a link to Parking By-Law Maintenance", () => {
    cy.get("a[href*='/admin/bylaws']").should("not.exist");
  });
});