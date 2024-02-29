import { testUpdate } from '../../../test/_globals.js';
import { login, logout } from '../../support/index.js';
describe('Ticket Search - Update User', () => {
    beforeEach(() => {
        logout();
        login(testUpdate);
        cy.visit('/tickets');
        cy.location('pathname').should('equal', '/tickets');
    });
    afterEach(logout);
    it('Has link to new ticket', () => {
        cy.get("a[href*='/new']").should('exist');
    });
});
