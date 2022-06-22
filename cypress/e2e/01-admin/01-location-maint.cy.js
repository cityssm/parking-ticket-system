import { testAdmin } from "../../../test/_globals.js";
import { logout, login } from "../../support/index.js";
import { randomString } from "../../support/utilities.js";
describe("Admin - Locations", function () {
    before(function () {
        logout();
        login(testAdmin);
    });
    after(logout);
    beforeEach("Loads page", function () {
        cy.visit("/admin/locations");
        cy.location("pathname").should("equal", "/admin/locations");
    });
    it("Adds ten new locations", function () {
        var _loop_1 = function (index) {
            cy.get("button[data-cy='add-location']").click();
            cy.get(".modal").should("be.visible");
            var locationSuffix = "-" + randomString();
            cy.fixture("location.json").then(function (locationData) {
                var locationKey = locationData.locationKeyPrefix + locationSuffix;
                var locationName = locationData.locationNamePrefix + locationSuffix;
                cy.get(".modal input[name='locationKey']").type(locationKey);
                cy.get(".modal select[name='locationClassKey']").select(1);
                cy.get(".modal input[name='locationName']").type(locationName);
                cy.get(".modal form").submit();
            });
            cy.get(".modal").should("not.exist");
            cy.fixture("location.json").then(function (locationData) {
                var locationName = locationData.locationNamePrefix + locationSuffix;
                cy.get("[data-cy='results'] a").contains(locationName);
            });
        };
        for (var index = 0; index < 10; index += 1) {
            _loop_1(index);
        }
    });
    it("Updates a location", function () {
        cy.get("[data-cy='results'] a")
            .first()
            .click();
        cy.get(".modal")
            .should("be.visible")
            .should("have.length", 1);
        cy.get(".modal [name='locationClassKey']").select(2);
        var newLocationName = "New Location-" + randomString();
        cy.get(".modal [name='locationName']").clear().type(newLocationName);
        cy.get(".modal form").submit();
        cy.get(".modal").should("not.exist");
        cy.get("[data-cy='results'] a")
            .contains(newLocationName);
    });
    it("Removes a location", function () {
        cy.get("[data-cy='results'] a")
            .first()
            .click({ force: true });
        cy.get(".modal")
            .should("be.visible")
            .should("have.length", 1);
        cy.get(".modal [name='locationName']").invoke("val").then(function (locationName) {
            cy.get(".modal [data-cy='remove']").click();
            cy.focused().click();
            cy.get(".modal").should("not.exist");
            cy.get("[data-cy='results'] a")
                .contains(locationName)
                .should("have.length", 0);
        });
    });
});
