import { testAdmin } from "../../../test/_globals.js";
import { logout, login } from "../../support/index.js";
import { randomString } from "../../support/utilities.js";
describe("Admin - Parking By-Laws", function () {
    before(function () {
        logout();
        login(testAdmin);
    });
    after(logout);
    it("Loads page", function () {
        cy.visit("/admin/bylaws");
        cy.location("pathname").should("equal", "/admin/bylaws");
    });
    it("Adds three new by-laws", function () {
        var _loop_1 = function (index) {
            cy.get("button[data-cy='add-bylaw']").click();
            cy.get(".modal").should("be.visible");
            var bylawNumberSuffix = "-" + randomString();
            cy.fixture("bylaw.json").then(function (bylawData) {
                var bylawNumber = bylawData.bylawNumberPrefix + bylawNumberSuffix;
                cy.get(".modal input[name='bylawNumber']").type(bylawNumber);
                cy.get(".modal input[name='bylawDescription']").type(bylawData.bylawDescription);
                cy.get(".modal form").submit();
            });
            cy.get(".modal").should("not.exist");
            cy.fixture("bylaw.json").then(function (bylawData) {
                var bylawNumber = bylawData.bylawNumberPrefix + bylawNumberSuffix;
                cy.get("[data-cy='results'] a").contains(bylawNumber);
            });
        };
        for (var index = 0; index < 3; index += 1) {
            _loop_1(index);
        }
    });
    it("Updates a by-law", function () {
        cy.get("[data-cy='results'] a")
            .first()
            .click();
        cy.get(".modal")
            .should("be.visible")
            .should("have.length", 1);
        cy.get(".modal [name='bylawNumber']").invoke("val").then(function (bylawNumber) {
            var newBylawDescription = "Updated By-Law - " + randomString();
            cy.get(".modal [name='bylawDescription']").clear().type(newBylawDescription);
            cy.get(".modal form").submit();
            cy.get(".modal").should("not.exist");
            cy.get("[data-cy='results'] a")
                .contains(bylawNumber)
                .log("here")
                .parents("tr")
                .contains(newBylawDescription);
        });
    });
    it("Removes a by-law", function () {
        cy.get("[data-cy='results'] a")
            .first()
            .click();
        cy.get(".modal")
            .should("be.visible")
            .should("have.length", 1);
        cy.get(".modal [name='bylawNumber']").invoke("val").then(function (bylawNumber) {
            cy.get(".modal [data-cy='remove']").click();
            cy.focused().click();
            cy.get(".modal").should("not.exist");
            cy.get("[data-cy='results'] a")
                .contains(bylawNumber)
                .should("have.length", 0);
        });
    });
});
