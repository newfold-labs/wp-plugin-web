// <reference types="Cypress" />

describe('Home Page', function () {

	before(() => {
		cy.visit('/wp-admin/admin.php?page=web#/home');
		cy.injectAxe();
		
	});

	it('Header Exists', () => {
		cy
			.get('.wppw-header').contains('h2', 'Web.com')
			.scrollIntoView()
			.should('be.visible');
	});

	it('Is Accessible', () => {
		cy.wait(500);
		cy.checkA11y('.wppw-app-body');
	});

	it('Web Content Section Exists', () => {
		cy
			.get('.wppw-section-home-content').contains('h3', 'Content')
			.scrollIntoView()
			.should('be.visible');
	});

	it('Settings Section Exists', () => {
		cy
			.get('.wppw-section-home-settings').contains('h3', 'Settings')
			.scrollIntoView()
			.should('be.visible');
	});

	it('Hosting Section Exists', () => {
		cy
			.get('.wppw-section-home-hosting').contains('h3', 'Hosting')
			.scrollIntoView()
			.should('be.visible');
	});

});
