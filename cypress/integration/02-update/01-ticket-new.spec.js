import { testUpdate } from "../../../test/_globals.js";
import * as configFunctions from "../../../helpers/functions.config.js";
import { logout, login } from "../../support/index.js";
describe("Create a New Ticket", function () {
    before(function () {
        logout();
        login(testUpdate);
    });
    after(logout);
    it("Loads page", function () {
        cy.visit("/tickets/new");
        cy.location("pathname").should("equal", "/tickets/new");
    });
    it("Populates the basic \"Parking Ticket Details\"", function () {
        cy.fixture("ticket.json").then(function (ticketJSON) {
            var ticketNumber = ticketJSON.ticketNumberPrefix +
                ("0000" + Cypress._.random(1, 99999).toString()).slice(-5);
            var issueDate = new Date(Date.now() - (ticketJSON.issueDateOffsetDays * 86400 * 1000));
            cy.get("input[name='ticketNumber']").clear().type(ticketNumber);
            cy.get("input[name='issueDateString']").clear().then(function ($element) {
                $element.get(0).valueAsDate = issueDate;
            });
            cy.get("input[name='issueTimeString']").clear().type(ticketJSON.issueTimeString);
            cy.get("input[name='issuingOfficer']").clear().type(ticketJSON.issuingOfficer);
            cy.get("textarea[name='locationDescription']").clear().type(ticketJSON.locationDescription);
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
    it("Prepopulates the \"Licence Plate Country\" field", function () {
        var expectedLicencePlateCountry = configFunctions.getProperty("defaults.country");
        cy.get("input[name='licencePlateCountry']")
            .should("contain.value", expectedLicencePlateCountry);
    });
    it("Prepopulates the \"Licence Plate Province\" field", function () {
        var expectedLicencePlateProvince = configFunctions.getProperty("defaults.province");
        cy.get("input[name='licencePlateProvince']")
            .should("contain.value", expectedLicencePlateProvince);
    });
    it("Populates the basic \"Vehicle Details\"", function () {
        cy.fixture("ticket.json").then(function (ticketJSON) {
            cy.get("input[name='licencePlateNumber']").clear().type(ticketJSON.licencePlateNumber);
            cy.get("input[name='licencePlateExpiryYear']").clear().type((new Date().getFullYear() + 1).toString());
            cy.get("select[name='licencePlateExpiryMonth']").select(ticketJSON.licencePlateExpiryMonth);
            cy.get("input[name='vehicleMakeModel']").clear().type(ticketJSON.vehicleMakeModel);
            cy.get("input[name='vehicleVIN']").clear().type(ticketJSON.vehicleVIN);
        });
    });
    it("Disable required fields when the licence plate is unavailable", function () {
        cy.get("input[name='licencePlateIsMissing']").check({ force: true });
        cy.get("input[name='licencePlateCountry']")
            .should("not.have.attr", "required");
        cy.get("input[name='licencePlateProvince']")
            .should("not.have.attr", "required");
        cy.get("input[name='licencePlateNumber']")
            .should("not.have.attr", "required");
    });
    it("Enforce required fields when the licence plate is available", function () {
        cy.get("input[name='licencePlateIsMissing']").uncheck({ force: true });
        cy.get("input[name='licencePlateCountry']")
            .should("have.attr", "required");
        cy.get("input[name='licencePlateProvince']")
            .should("have.attr", "required");
        cy.get("input[name='licencePlateNumber']")
            .should("have.attr", "required");
    });
    it("Submits the form, creates a record", function () {
        cy.get("button[type='submit']")
            .should("contain.text", "Create New Ticket")
            .click();
        cy.get(".modal")
            .should("be.visible")
            .should("contain", "success");
    });
});
