<a href="https://web.com/" target="_blank">
    <img src="https://raw.githubusercontent.com/newfold-labs/wp-plugin-web/main/assets/svg/web-logo.svg" alt="Web.com Logo" title="Web.com" align="right" height="32" />
</a>

# Web.com WordPress Plugin

[![Version Number](https://img.shields.io/github/v/release/newfold-labs/wp-plugin-web?color=21a0ed&labelColor=333333)](https://github.com/newfold/wp-plugin-web/releases)
[![Lint PHP](https://github.com/newfold-labs/wp-plugin-web/actions/workflows/lint-php.yml/badge.svg?branch=main)](https://github.com/newfold-labs/wp-plugin-web/actions/workflows/lint-php.yml)
[![Cypress Tests](https://github.com/newfold-labs/wp-plugin-web/actions/workflows/cypress-tests.yml/badge.svg?branch=main)](https://github.com/newfold-labs/wp-plugin-web/actions/workflows/cypress-tests.yml)

WordPress plugin that integrates a WordPress site with the Web.com control panel, including performance, security, and
update features.

# Installation

Find the `wp-plugin-web.zip` asset for your preferred version at: https://github.com/newfold-labs/wp-plugin-web/releases/.

Alternatively, check the updater endpoint for the latest version at: https://hiive.cloud/workers/release-api/plugins/newfold-labs/wp-plugin-web, this also includes a download link to the latest zip file or use this link to access the latest download: https://hiive.cloud/workers/release-api/plugins/newfold-labs/wp-plugin-web/download/.

# Releasing Updates

This plugin has version number set in 3 distinct places in 2 files:

- the plugin header info (wp-plugin-web/wp-plugin-web.php line 14) - this is used in the plugin php code.
- the constant WEB_PLUGIN_VERSION (wp-plugin-web/wp-plugin-web.php line 34) - this is used by
  WordPress.
- in the package.json version value (wp-plugin-web/package.json line 5) this is used by the build step to place
  the release files within a matching version directory for convenient cache busting. All 3 instances need to be
  incremented in conjuction with new releases via github tagging.
  (In a perfect world, we have a runner increment and/or validate this)
