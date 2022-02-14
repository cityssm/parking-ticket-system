import { testUpdate } from "../../../test/_globals.js";
import { logout, login } from "../../support/index.js";
var saveTicket = function () {
    cy.get("button[type='submit']")
        .contains("Update")
        .click();
    cy.get(".tag")
        .should("contain.text", "Saved Successfully")
        .should("exist");
};
describe("Ticket Edit - Update User", function () {
    before(function () {
        logout();
        login(testUpdate);
    });
    it("Loads edit page for an unresolved ticket", function () {
        cy.visit("/tickets");
        cy.get("[data-cy='results']")
            .contains("unresolved", { matchCase: false })
            .parents("tr")
            .find("a")
            .click();
        cy.get("a[href$='/edit']").click();
        cy.location("pathname")
            .should("contain", "/tickets/")
            .should("contain", "/edit");
    });
    it("Can save ticket as loaded", function () {
        saveTicket();
    });
    it("Displays unsaved changes message", function () {
        cy.get("textarea[name='locationDescription']")
            .clear()
            .type("Updated Location Description - " + Cypress._.random(10000, 99999).toString());
        cy.get("textarea[name='parkingOffence']")
            .clear()
            .type("Updated Offence Description - " + Cypress._.random(10000, 99999).toString());
        cy.wait(200);
        cy.get(".tag")
            .should("contain.text", "Unsaved Changes")
            .should("exist");
    });
    it("Can save ticket after changes", function () {
        saveTicket();
    });
    describe("Remarks", function () {
        it("Adds a remark", function () {
            cy.get("button[data-cy='add-remark']").click();
            var remark = "New Remark - " + Cypress._.random(10000, 99999).toString();
            cy.get(".modal")
                .should("be.visible")
                .find("textarea[name='remark']").type(remark);
            cy.get(".modal form").submit();
            cy.get(".modal")
                .should("not.exist");
            cy.get("button[data-cy='add-remark']")
                .parents(".panel")
                .should("contain.text", remark);
        });
        it("Updates a remark", function () {
            cy.get("button[data-cy='edit-remark']")
                .first()
                .click();
            var remark = "Updated Remark - " + Cypress._.random(10000, 99999).toString();
            cy.get(".modal")
                .should("be.visible")
                .find("textarea[name='remark']").clear().type(remark);
            cy.get(".modal form").submit();
            cy.get(".modal")
                .should("not.exist");
            cy.get("button[data-cy='add-remark']")
                .parents(".panel")
                .should("contain.text", remark);
        });
        it("Deletes a remark", function () {
            cy.get("button[data-cy='delete-remark']")
                .first()
                .click();
            cy.get(".modal")
                .should("be.visible")
                .find("button")
                .contains("yes", { matchCase: false })
                .click();
            cy.get(".modal")
                .should("not.exist");
        });
    });
    describe("Statuses", function () {
        it("Adds a paid status that resolves the ticket", function () {
            cy.get("button[data-cy='add-status-paid']").click();
            cy.get(".modal")
                .should("be.visible");
            cy.fixture("ticket.json", function (ticketJSON) {
                cy.get(".modal input[name='statusField']")
                    .clear()
                    .type(ticketJSON.statusPaid_statusField);
                cy.get(".modal input[name='statusField2']")
                    .clear()
                    .type(ticketJSON.statusPaid_statusField2);
                cy.get(".modal textarea[name='statusNote']")
                    .clear()
                    .type(ticketJSON.statusPaid_statusNote);
            });
            cy.get(".modal input[name='resolveTicket']")
                .check({ force: true });
            cy.get(".modal form").submit();
            cy.get(".modal")
                .should("not.exist");
        });
    });
});
