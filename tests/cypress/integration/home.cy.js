// <reference types="Cypress" />

describe('Home Page', { testIsolation: true }, () => {
	const appClass = '.' + Cypress.env( 'appId' );

	beforeEach(() => {
		cy.wpLogin();
		cy.visit(`/wp-admin/admin.php?page=${ Cypress.env( 'pluginId' ) }#/home`);
	});

	it('Home Page Header Exists', () => {
		cy.get( appClass + '-app-home-header')
			.should('be.visible')
			.contains('Home');
	});

	it('Is Accessible', () => {
		cy.injectAxe();
		cy.wait(1000);
		cy.a11y( appClass + '-app-body');
	});

	it('Maintenance Mode Section Exists', () => {
		cy
			.get( appClass + '-app-home-coming-soon').contains('h3', 'Site Status')
			.scrollIntoView()
			.should('be.visible');
	});

	it('Website Content Section Exists', () => {
		cy
			.get( appClass + '-app-home-content').contains('h3', 'Website Content')
			.scrollIntoView()
			.should('be.visible');
	});

	it('Settings and Performance Section Exists', () => {
		cy
			.get( appClass + '-app-home-settings').contains('h3', 'Settings and Performance')
			.scrollIntoView()
			.should('be.visible');
	});

	it('Web Hosting Section Exists', () => {
		cy
			.get( appClass + '-app-home-hosting').contains('h3', 'Web Hosting')
			.scrollIntoView()
			.should('be.visible');
	});
});
