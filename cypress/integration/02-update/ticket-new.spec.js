import { testUpdate } from "../../../test/_globals.js";
import { logout, login } from "../../support/index.js";
describe("Create a New Ticket", function () {
    before(function () {
        logout();
        login(testUpdate);
    });
    it("Loads page", function () {
        cy.visit("/tickets/new");
        cy.location("pathname").should("equal", "/tickets/new");
    });
    it("Populates the basic \"Parking Ticket Details\"", function () {
        cy.fixture("ticket.json").then(function (ticketJSON) {
            cy.get("input[name='ticketNumber']").clear().type(ticketJSON.ticketNumber);
            cy.get("input[name='issueDateString']").clear().type(ticketJSON.issueDateString);
            cy.get("input[name='issueTimeString']").clear().type(ticketJSON.issueTimeString);
            cy.get("input[name='issuingOfficer']").clear().type(ticketJSON.issuingOfficer);
            cy.get("textarea[name='locationDescription']").clear().type(ticketJSON.locationDecsription);
        });
    });
    it("Populates the \"Location\" field", function () {
        cy.get("button[data-cy='select-location']")
            .click();
        cy.get(".modal")
            .should("be.visible")
            .find("a.panel-block")
            .first()
            .click();
        cy.get(".modal")
            .should("not.exist");
        cy.get("input[name='locationName']")
            .should("not.have.value", "");
    });
    it("Populates the \"By-Law\" field", function () {
        cy.get("button[data-cy='select-bylaw']")
            .click();
        cy.get(".modal")
            .should("be.visible")
            .find("a.panel-block")
            .first()
            .click();
        cy.get(".modal")
            .should("not.exist");
        cy.get("input[name='bylawNumber']")
            .should("not.have.value", "");
    });
    it("Has automatically populated offence amounts from by-law", function () {
        cy.get("input[name='offenceAmount']").should("not.have.value", "");
        cy.get("input[name='discountOffenceAmount']").should("not.have.value", "");
        cy.get("input[name='discountDays']").should("not.have.value", "");
    });
});
