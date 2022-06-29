// <reference types="Cypress" />
const marketplace = require('../fixtures/products.json');

describe('Marketplace Page', function () {

	before(() => {
		cy.server();
		cy.route('GET', '**/newfold-marketplace/v1/marketplace**', 'fx:marketplace').as('marketplace');
		cy.visit('/wp-admin/admin.php?page=web#/marketplace');
		cy.injectAxe();
	});

	it('Exists', () => {
		cy.contains('button', 'Everything');
	});

	it('Is Accessible', () => {
		cy.wait(1000);
		cy.checkA11y('.wppw-app-body');
	});

	it('Product grid has 12 items', () => {
		cy.get('.marketplace-item').should('have.length', 12);
	});

	it('First product card renders correctly', () => {
		cy.get('#marketplace-item-1fc92f8a-bb9f-47c8-9808-aab9c82d6bf2').as('card');

		cy.get('@card')
			.findByRole('link', {name: 'Learn More'})
			.scrollIntoView()
			.should('be.visible')
			.should('have.attr', 'href')
			.and('include', 'https://www.web.com/websites/website-design-services');

		cy.get('@card').first().within(() => {
			cy.get('.components-card__header')
				.contains('Web Design Services')
				.should('be.visible');
			cy.get('.components-card__media').should('be.visible');
			cy.get('.components-card__header em.price').should('not.exist');
		});
	});

	it('Second product card render correctly', () => {
		cy.get('#marketplace-item-2a1dadb5-f58d-4ae4-a26b-27efb09136eb').as('card');

		cy.get('@card')
			.findByRole('link', {name: 'Buy Now'})
			.scrollIntoView()
			.should('be.visible')
			.should('have.attr', 'href')
			.and('include', 'https://www.mojomarketplace.com/cart?item_id=5377b431-d8a8-431b-a711-50c10a141528');

		cy.get('@card').first().within(() => {
			cy.get('.components-card__header')
				.contains('Highend')
				.should('be.visible');
			cy.get('.components-card__media').should('be.visible');
			cy.get('.components-card__header em.price')
				.contains('$59.00')
				.should('be.visible');
		});
	});
	
	it('CTA links have target=_blank', () => {
		cy.get('#marketplace-item-1fc92f8a-bb9f-47c8-9808-aab9c82d6bf2').as('card');

		cy.get('@card')
			.findByRole('link', {name: 'Learn More'})
			.scrollIntoView()
			.should('have.attr', 'target')
			.and('include', '_blank');
	});

	it('Load more button loads more products', () => {
		cy.get('.marketplace-item').should('have.length', 12);

		cy.contains('button', 'Load More');

		cy.get('.marketplaceList button')
			.scrollIntoView()
			.click();

		cy.wait(300);

		cy.get('.marketplace-item').should('have.length', 19);
	});

	it('Category Tab Filters properly', () => {
		cy.contains('button', 'Services');
		cy.contains('button', 'SEO');

		cy.get('#tab-panel-0-Services').click();
		cy.wait(300);
		cy.get('.marketplace-item').should('have.length', 5);

		cy.get('#marketplace-item-1fc92f8a-bb9f-47c8-9808-aab9c82d6bf2 h3')
			.scrollIntoView()
			.should('be.visible')
			.should('have.text', 'Web Design Services');
		
		cy.get('#tab-panel-0-SEO').click();
		cy.wait(300);
		cy.get('.marketplace-item').should('have.length', 3);
	
		cy.get('#marketplace-item-7beee5ae-2e91-4282-9930-15ada43fc738 h3')
			.scrollIntoView()
			.should('be.visible')
			.should('have.text', 'Yoast Premium');
	});

	// CTB Not supported yet
	// it('Product CTB cards render correctly', () => {
	// 	cy.get('.marketplace-item-ec14a614-8672-4094-8310-cb0b1eb0f176').as('card');

	// 	cy.get('@card')
	// 		.findByRole('button', {name: 'Buy Now'})
	// 		.scrollIntoView()
	// 		.should('be.visible')
	// 		.should('have.attr', 'data-action')
	// 		.and('include', 'load-nfd-ctb');

	// 	cy.get('@card').first().within(() => {
	// 		cy.get('.components-card__header').should('be.visible');
	// 		cy.get('.components-card__media').should('be.visible');
	// 	});
	// });

});
