import { testUpdate } from "../../../test/_globals.js";
import { logout, login } from "../../support/index.js";
var clearCurrentBatch = function () {
    cy.get("button[data-cy='clear-batch']")
        .should(Cypress._.noop)
        .then(function ($buttons) {
        if ($buttons.length > 0) {
            cy.get("button[data-cy='clear-batch']").click();
            cy.get(".modal")
                .should("be.visible")
                .find("button")
                .contains("Yes")
                .click();
        }
    });
};
var addAllTicketsToBatch = function () {
    cy.intercept("POST", "/plates/doAddAllParkingTicketsToLookupBatch").as("add");
    cy.get("button[data-cy='add-tickets']")
        .click();
    cy.wait("@add");
    cy.get("button[data-cy='add-tickets']")
        .should("not.exist");
};
describe("MTO Licence Plate Export", function () {
    before(function () {
        logout();
        login(testUpdate);
    });
    it("Loads page", function () {
        cy.visit("/plates-ontario/mtoExport");
        cy.location("pathname")
            .should("equal", "/plates-ontario/mtoExport");
        clearCurrentBatch();
    });
    it("Creates a new batch", function () {
        cy.get("button[data-cy='select-batch']")
            .click();
        cy.get(".modal")
            .should("be.visible")
            .find("button")
            .contains("Create")
            .click();
        cy.get(".modal")
            .should("be.visible")
            .find("button")
            .contains("Regular")
            .click();
        cy.get(".modal")
            .should("not.exist");
    });
    it("Adds all tickets to the batch", function () {
        addAllTicketsToBatch();
    });
    it("Clears the batch", function () {
        clearCurrentBatch();
    });
    it("Adds tickets individually", function () {
        cy.get("button[data-cy='add-ticket']").each(function ($button) {
            cy.wrap($button).click();
        });
    });
    it("Removes tickets individually", function () {
        cy.get("button[data-cy='remove-ticket']").each(function ($button) {
            cy.wrap($button).click();
        });
    });
    it("Adds all tickets to the batch again", function () {
        addAllTicketsToBatch();
    });
    it("Locks the batch", function () {
        cy.get("button[data-cy='lock-batch']")
            .click();
        cy.get(".modal")
            .should("be.visible")
            .find("button")
            .contains("Yes")
            .click();
        cy.get("button[data-cy='lock-batch']")
            .should("be.disabled");
        cy.get("button")
            .contains("Download File")
            .should("exist");
    });
});
