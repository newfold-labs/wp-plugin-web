// <reference types="Cypress" />

describe('Navigation', { testIsolation: true }, () => {
	const appClass = '.' + Cypress.env( 'appId' );

	beforeEach(() => {
		cy.wpLogin();
		cy.visit(`/wp-admin/admin.php?page=${ Cypress.env( 'pluginId' ) }#`);
	});

	it( "Admin submenu should exist", () => {
		cy.get( '#adminmenu #toplevel_page_' + Cypress.env( 'pluginId' ) + ' ul.wp-submenu' ).should(
			'exist'
		);
	} );

	it('Logo Links to home', () => {
		cy.get( '#adminmenu #toplevel_page_' + Cypress.env( 'pluginId' ) + ' a.toplevel_page_web').click();
		cy.wait(500);
		cy.url().should('include', 'page=web');
	});

	// test main nav
	it('Main nav links properly navigates', () => {
		cy
			.get( '#adminmenu #toplevel_page_' + Cypress.env( 'pluginId' ) + ' ul.wp-submenu li a[href*="#/marketplace"]')
			.should('be.visible');
		
		cy.get( '#adminmenu #toplevel_page_' + Cypress.env( 'pluginId' ) + ' ul.wp-submenu li a[href*="#/marketplace"]').click();
		cy.wait(500);
		cy.hash().should('eq', '#/marketplace');
		cy
			.get( '#adminmenu #toplevel_page_' + Cypress.env( 'pluginId' ) + ' ul.wp-submenu li a[href*="#/marketplace"]')
			.parent()
			.should('have.class', 'current');

		cy.get( '#adminmenu #toplevel_page_' + Cypress.env( 'pluginId' ) + ' ul.wp-submenu li a[href*="#/settings"]')
			.should('be.visible')
			.click();
		cy.wait(500);
		cy.hash().should('eq', '#/settings');
		cy
			.get( '#adminmenu #toplevel_page_' + Cypress.env( 'pluginId' ) + ' ul.wp-submenu li a[href*="#/marketplace"]')
			.parent()
			.should('not.have.class', 'current');
	});

	it( 'Mobile nav links display and link properly on mobile', () => {
		cy.get( '#nfd-app-mobile-nav' ).should( 'not.exist' );
		cy.viewport( 'iphone-x' );
		cy.get( '#nfd-app-mobile-nav' ).should( 'be.visible' );

		cy.get( appClass + '-app-navitem-Home' ).should( 'not.exist' );

		cy.get( '#nfd-app-mobile-nav' ).click();
		cy.wait( 500 );
		cy.get( appClass + '-app-navitem-Home' ).should( 'be.visible' );
		cy.get( 'button.nfd-modal__close-button' ).should( 'be.visible' );
		cy.get( 'button.nfd-modal__close-button' ).click();
		cy.get( appClass + '-app-navitem-Home' ).should( 'not.exist' );
	});
});
