// <reference types="Cypress" />

describe('Help Page', { testIsolation: true }, () => {

	beforeEach(() => {
		cy.wpLogin();
		cy.visit(`/wp-admin/admin.php?page=${ Cypress.env( 'pluginId' ) }#/help`);
		
		// Wait for NewfoldRuntime to be fully initialized
		cy.window().should('have.property', 'NewfoldRuntime');
		cy.wait(1000);
		
		// Ensure the help page container is loaded before running tests
		cy.get('.wppw-app-help-container', { timeout: 5000 }).should('exist');
	});
	
	it('Is Accessible', () => {
		cy.injectAxe();
		cy.wait(1000); // Wait for React app to fully load
		cy.a11y('.' + Cypress.env( 'appId' ) + '-app-body');
	});

	it('Cards Exist', () => {
		cy.get('.card-help-phone').contains('h3', 'Phone')
			.scrollIntoView()
			.should('be.visible');
	
		cy.get('.card-help-blog').contains('h3', 'Blog')
			.scrollIntoView()
			.should('be.visible');
	});
	
});
