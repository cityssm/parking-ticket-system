import { testUpdate } from '../../../test/_globals.js';
import { logout, login } from '../../support/index.js';
function saveTicket() {
    cy.get("button[type='submit']").contains('Update').click();
    cy.get('.tag').should('contain.text', 'Saved Successfully').should('exist');
}
function unresolveTicket() {
    cy.get('button')
        .contains('Remove Resolved Status', { matchCase: false })
        .click();
    cy.get('.modal').should('be.visible').find('button').contains('Yes').click();
    cy.get("a[href$='/edit']").should('exist');
}
describe('Ticket Edit - Update User', () => {
    beforeEach(() => {
        logout();
        login(testUpdate);
        cy.visit('/tickets');
        cy.get("a[href$='/edit']").click();
    });
    afterEach(logout);
    it('Loads edit page for an unresolved ticket', () => {
        cy.intercept('POST', '/tickets/doGetTickets').as('results');
        cy.visit('/tickets');
        cy.wait('@results');
        cy.get("select[name='isResolved']").select('').select('0');
        cy.wait('@results');
        cy.get("[data-cy='results']").find('a').first().click();
        cy.get("a[href$='/edit']").click();
        cy.location('pathname')
            .should('contain', '/tickets/')
            .should('contain', '/edit');
    });
    it('Has no detectable accessibility issues', () => {
        cy.injectAxe();
        cy.checkA11y();
    });
    it('Can save ticket as loaded', () => {
        saveTicket();
    });
    it('Displays unsaved changes message', () => {
        cy.get("textarea[name='locationDescription']")
            .clear()
            .type('Updated Location Description - ' +
            Cypress._.random(10000, 99999).toString());
        cy.get("textarea[name='parkingOffence']")
            .clear()
            .type('Updated Offence Description - ' +
            Cypress._.random(10000, 99999).toString());
        cy.wait(200);
        cy.get('.tag').should('contain.text', 'Unsaved Changes').should('exist');
    });
    it('Can save ticket after changes', () => {
        saveTicket();
    });
    describe('Remarks', () => {
        it('Adds a remark', () => {
            cy.get("button[data-cy='add-remark']").click();
            const remark = 'New Remark - ' + Cypress._.random(10000, 99999).toString();
            cy.get('.modal')
                .should('be.visible')
                .find("textarea[name='remark']")
                .type(remark);
            cy.get('.modal form').submit();
            cy.get('.modal').should('not.exist');
            cy.get("button[data-cy='add-remark']")
                .parents('.panel')
                .should('contain.text', remark);
        });
        it('Updates a remark', () => {
            cy.get("button[data-cy='edit-remark']").first().click();
            const remark = 'Updated Remark - ' + Cypress._.random(10000, 99999).toString();
            cy.get('.modal')
                .should('be.visible')
                .find("textarea[name='remark']")
                .clear()
                .type(remark);
            cy.get('.modal form').submit();
            cy.get('.modal').should('not.exist');
            cy.get("button[data-cy='add-remark']")
                .parents('.panel')
                .should('contain.text', remark);
        });
        it('Deletes a remark', () => {
            cy.get("button[data-cy='delete-remark']").first().click();
            cy.get('.modal')
                .should('be.visible')
                .find('button')
                .contains('yes', { matchCase: false })
                .click();
            cy.get('.modal').should('not.exist');
        });
    });
    describe('Statuses', () => {
        it('Adds a paid status that resolves the ticket', () => {
            cy.get("button[data-cy='add-status-paid']").click();
            cy.get('.modal').should('be.visible');
            cy.fixture('ticket.json').then((ticketJSON) => {
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
            cy.get(".modal input[name='resolveTicket']").check({ force: true });
            cy.get('.modal form').submit();
            cy.get('.modal').should('not.exist');
        });
    });
});
describe('Ticket View - Update User', () => {
    before(() => {
        logout();
        login(testUpdate);
    });
    after(logout);
    it('Unresolves a resolved ticket', () => {
        cy.intercept('POST', '/tickets/doGetTickets').as('results');
        cy.visit('/tickets');
        cy.wait('@results');
        cy.get("select[name='isResolved']").select('').select('1');
        cy.wait('@results');
        cy.get("[data-cy='results']").find('a').first().click();
        unresolveTicket();
    });
});
describe('Ticket Edit - Update User', () => {
    before(() => {
        logout();
        login(testUpdate);
    });
    it('Loads edit page for a paid, unresolved ticket', () => {
        cy.intercept('POST', '/tickets/doGetTickets').as('results');
        cy.visit('/tickets');
        cy.wait('@results');
        cy.get("select[name='isResolved']").select('').select('0');
        cy.wait('@results');
        cy.get("[data-cy='results']")
            .contains('tr', 'Paid')
            .first()
            .find('a')
            .click();
        cy.get("a[href$='/edit']").click();
        cy.location('pathname')
            .should('contain', '/tickets/')
            .should('contain', '/edit');
    });
    it('Resolves the ticket', () => {
        cy.get("button[data-cy='resolve']").click();
        cy.get('.modal').should('be.visible').find('button').contains('Yes').click();
        cy.location('pathname').should('not.contain', '/edit');
    });
    it('Unresolves the ticket again', () => {
        unresolveTicket();
    });
});
