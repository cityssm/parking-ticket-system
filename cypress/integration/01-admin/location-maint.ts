/* eslint-disable unicorn/filename-case, promise/catch-or-return, promise/always-return */

import { testAdmin } from "../../../test/_globals.js";

import { logout, login } from "../../support/index.js";
import { randomString } from "../../support/utilities.js";


describe("Admin - Locations", () => {

  before(() => {
    logout();
    login(testAdmin)
  });

  //after(logout);

  it("Loads page", () => {
    cy.visit("/admin/locations");
    cy.location("pathname").should("equal", "/admin/locations");
  });

  it("Adds three new locations", () => {

    for (let index = 0; index < 3; index += 1) {

      cy.get("button[data-cy='add-location']").click();

      cy.get(".modal").should("be.visible");

      const locationSuffix = "-" + randomString();

      cy.fixture("location.json").then((locationData) => {

        const locationKey = locationData.locationKeyPrefix + locationSuffix;
        const locationName = locationData.locationNamePrefix + locationSuffix;

        cy.get(".modal input[name='locationKey']").type(locationKey);

        cy.get(".modal select[name='locationClassKey']").select(1);
        cy.get(".modal input[name='locationName']").type(locationName);

        cy.get(".modal form").submit();
      });

      cy.get(".modal").should("not.exist");

      cy.fixture("location.json").then((locationData) => {
        const locationName = locationData.locationNamePrefix + locationSuffix;
        cy.get("[data-cy='results'] a").contains(locationName);
      });
    }
  });

  it("Updates a location", () => {

    cy.get("[data-cy='results'] a")
      .first()
      .click();

    cy.get(".modal")
      .should("be.visible")
      .should("have.length", 1);

    cy.get(".modal [name='locationClassKey']").select(2);

    const newLocationName = "New Location-" + randomString();

    cy.get(".modal [name='locationName']").clear().type(newLocationName);

    cy.get(".modal form").submit();

    cy.get(".modal").should("not.exist");

    cy.get("[data-cy='results'] a")
      .contains(newLocationName);
  });

  it("Removes a location", () => {

    cy.get("[data-cy='results'] a")
      .first()
      .click({ force: true });

    cy.get(".modal")
      .should("be.visible")
      .should("have.length", 1);

    cy.get(".modal [name='locationName']").invoke("val").then((locationName: string) => {

      cy.get(".modal [data-cy='remove']").click();

      cy.focused().click();

      cy.get(".modal").should("not.exist");

      cy.get("[data-cy='results'] a")
        .contains(locationName)
        .should("have.length", 0);
    });
  });
});
