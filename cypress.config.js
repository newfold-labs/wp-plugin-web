const { defineConfig } = require('cypress')
const { phpVersion, core } = require('./.wp-env.json')
const wpVersion = /[^/]*$/.exec(core)[0]

module.exports = defineConfig({
  projectId: "dxko36",
  env: {
    wpUsername: 'admin',
    wpPassword: 'password',
    wpVersion,
    phpVersion,
    pluginId: 'web',
    appId: 'wppw',
    pluginSlug: 'wp-plugin-web',
  },
  fixturesFolder: 'tests/cypress/fixtures',
  screenshotsFolder: 'tests/cypress/screenshots',
  video: true,
  videosFolder: 'tests/cypress/videos',
  chromeWebSecurity: false,
  viewportWidth: 1024,
	viewportHeight: 768,
	blockHosts: [
		'*doubleclick.net',
		'*jnn-pa.googleapis.com',
		'*youtube.com',
	],
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./tests/cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:8886',
    specPattern: [
      'tests/cypress/integration/**/*.cy.{js,jsx,ts,tsx}',
      'vendor/newfold-labs/**/tests/cypress/integration/**/*.cy.{js,jsx,ts,tsx}',
    ],
    supportFile: 'tests/cypress/support/index.js',
    testIsolation: false,
		excludeSpecPattern: [
      'vendor/newfold-labs/wp-module-coming-soon/tests/cypress/integration/', // until ecommerce module is added use the local coming soon test instead
    ],
    experimentalRunAllSpecs: true,
  },
  retries: 1,
  experimentalMemoryManagement: true,
})
