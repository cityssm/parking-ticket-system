import { testAdmin } from '../../../test/_globals.js';
import { login, logout } from '../../support/index.js';
import { randomString } from '../../support/utilities.js';
describe('Admin - Parking By-Laws', () => {
    beforeEach(() => {
        logout();
        login(testAdmin);
        cy.visit('/admin/bylaws');
        cy.location('pathname').should('equal', '/admin/bylaws');
    });
    afterEach(logout);
    it('Adds ten new by-laws', () => {
        for (let index = 0; index < 10; index += 1) {
            cy.get("button[data-cy='add-bylaw']").click();
            cy.get('.modal').should('be.visible');
            const bylawNumberSuffix = `-${randomString()}`;
            cy.fixture('bylaw.json').then((bylawData) => {
                const bylawNumber = bylawData.bylawNumberPrefix + bylawNumberSuffix;
                cy.get(".modal input[name='bylawNumber']").type(bylawNumber);
                cy.get(".modal input[name='bylawDescription']").type(bylawData.bylawDescription);
                cy.get('.modal form').submit();
            });
            cy.get('.modal').should('not.exist');
            cy.fixture('bylaw.json').then((bylawData) => {
                const bylawNumber = bylawData.bylawNumberPrefix + bylawNumberSuffix;
                cy.get("[data-cy='results'] a").contains(bylawNumber);
            });
        }
    });
    it('Updates a by-law', () => {
        cy.get("[data-cy='results'] a").first().click();
        cy.get('.modal').should('be.visible').should('have.length', 1);
        cy.get(".modal [name='bylawNumber']")
            .invoke('val')
            .then((bylawNumber) => {
            const newBylawDescription = `Updated By-Law - ${randomString()}`;
            cy.get(".modal [name='bylawDescription']")
                .clear()
                .type(newBylawDescription);
            cy.get('.modal form').submit();
            cy.get('.modal').should('not.exist');
            cy.get("[data-cy='results'] a")
                .contains(bylawNumber)
                .closest('tr')
                .contains(newBylawDescription);
        });
    });
    it('Removes a by-law', () => {
        cy.get("[data-cy='results'] a").first().click();
        cy.get('.modal').should('be.visible').should('have.length', 1);
        cy.get(".modal [name='bylawNumber']")
            .invoke('val')
            .then((bylawNumber) => {
            cy.get(".modal [data-cy='remove']").click();
            cy.focused().click();
            cy.get('.modal').should('not.exist');
            cy.get("[data-cy='results'] a")
                .contains(bylawNumber)
                .should('have.length', 0);
        });
    });
});
