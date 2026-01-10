// <reference types="Cypress" />

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import '@testing-library/cypress/add-commands';

Cypress.Commands.add('login', (username, password) => {
	cy
		.getCookies()
		.then(cookies => {
			let hasMatch = false;
			cookies.forEach((cookie) => {
				if (cookie.name.substr(0, 20) === 'wordpress_logged_in_') {
					hasMatch = true;
				}
			});
			if (!hasMatch) {
				cy.visit('/wp-login.php').wait(1000);
				cy.get('#user_login').type(username);
				cy.get('#user_pass').type(`${ password }{enter}`);

				// Disable onboarding redirect for tests using REST API
				// This prevents automatic redirects to the onboarding flow after login
				// Using cy.request() to avoid triggering the redirect by visiting admin pages
				cy.request({
					method: 'POST',
					url: '/wp-json/wp/v2/settings',
					body: {
						nfd_module_onboarding_redirect: '0'
					},
					failOnStatusCode: false
				});

				// Speed up tests by setting permalink structure once
				cy.setPermalinkStructure();
			}
		});
});

Cypress.Commands.add( 'wpLogin', () => {
	cy.login( Cypress.env( 'wpUsername' ), Cypress.env( 'wpPassword' ) );
} );

Cypress.Commands.add('logout', () => {
	cy
		.getCookies()
		.then(
			cookies => {
				cookies.forEach(
					cookie => {
						cy.clearCookie(cookie.name);
					}
				)
			}
		);
});

// Print cypress-axe violations to the terminal
function printAccessibilityViolations(violations) {
	cy.task(
		'log',
		`${violations.length} accessibility violation${
		  violations.length === 1 ? '' : 's'
		} ${violations.length === 1 ? 'was' : 'were'} detected`
	)
	// pluck specific keys to keep the table readable
	const violationData = violations.map(
	({ id, impact, description, nodes }) => ({
		id,
		impact,
		description,
		nodes: nodes.length
	})
	)

	cy.task('table', violationData)
}
  
Cypress.Commands.add( 
	'a11y', 
	(context) => {
		cy.checkA11y(context, null, printAccessibilityViolations, false);
	},
);

Cypress.Commands.add(
	'setPermalinkStructure',
	( structure = '/%postname%/' ) => {
		cy.request({
			method: 'GET',
			url: '/wp-json/',
			failOnStatusCode: false,
		}).then(result => {
			if(result.isOkStatusCode) {
				return;
			}
			const permalinkWpCliCommand = `wp rewrite structure "${structure}" --hard;`;
			const permalinkWpEnvCommand = `npx wp-env run cli ${permalinkWpCliCommand}`;
			const permalinkWpEnvTestCommand = `npx wp-env run tests-cli ${permalinkWpCliCommand}`;
			cy.exec( permalinkWpEnvCommand, {failOnNonZeroExit: true})
				.then((result) => {
					cy.request('/wp-json/');
				});
			cy.exec( permalinkWpEnvTestCommand, {failOnNonZeroExit: true})
				.then((result) => {
					cy.request('/wp-json/');
				});
		});
	}
);