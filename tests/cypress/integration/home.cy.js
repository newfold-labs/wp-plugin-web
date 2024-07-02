// <reference types="Cypress" />

describe('Home Page', function () {

	before(() => {
		cy.visit(`/wp-admin/admin.php?page=${Cypress.env('pluginId')}#/home`);
	});

	it('Site Info Exists', () => {
		cy.window().then((win) => {
			const siteTitle = win.NewfoldRuntime.siteTitle;

			cy.get('.wppw-app-site-info').contains('h3', siteTitle)
				.scrollIntoView()
				.should('be.visible');
		})
	});

	it('Is Accessible', () => {
		cy.injectAxe();
		cy.wait(500);
		cy.a11y('.wppw-app-body');
	});

	it('Maintenance Mode Section Exists', () => {
		cy
			.get('.wppw-app-home-coming-soon').contains('h3', 'Site Status')
			.scrollIntoView()
			.should('be.visible');
	});

	it('Website Content Section Exists', () => {
		cy
			.get('.wppw-app-home-content').contains('h3', 'Website Content')
			.scrollIntoView()
			.should('be.visible');
	});

	it('Settings and Performance Section Exists', () => {
		cy
			.get('.wppw-app-home-settings').contains('h3', 'Settings and Performance')
			.scrollIntoView()
			.should('be.visible');
	});

	it('Web Hosting Section Exists', () => {
		cy
			.get('.wppw-app-home-hosting').contains('h3', 'Web Hosting')
			.scrollIntoView()
			.should('be.visible');
	});
});
