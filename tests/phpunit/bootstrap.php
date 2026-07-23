<?php
/**
 * PHPUnit bootstrap for the Network Solutions plugin.
 *
 * @package WPPluginWeb
 */

// wp-phpunit/wp-phpunit normally sets WP_PHPUNIT__DIR itself, and its bootstrap normally finds
// yoast/phpunit-polyfills, via Composer `autoload.files` entries — but those only run once
// something has required vendor/autoload.php, which this file deliberately avoids doing early
// (see below). Load/set both directly so the test bootstrap doesn't depend on that side effect.
$vendor_dir = dirname( dirname( __DIR__ ) ) . '/vendor';

$wp_phpunit_dir = getenv( 'WP_PHPUNIT__DIR' );
if ( ! $wp_phpunit_dir ) {
	$wp_phpunit_dir = $vendor_dir . '/wp-phpunit/wp-phpunit';
	putenv( 'WP_PHPUNIT__DIR=' . $wp_phpunit_dir );
}

require_once $vendor_dir . '/yoast/phpunit-polyfills/phpunitpolyfills-autoload.php';
require_once $wp_phpunit_dir . '/includes/functions.php';

/**
 * Load the plugin under test the same way WordPress would load a regular plugin,
 * i.e. before the `plugins_loaded` action fires.
 *
 * Deliberately does NOT eagerly `require vendor/autoload.php` at the top of this file:
 * several Newfold Composer modules register themselves via Composer's `autoload.files`
 * and guard on `defined( 'ABSPATH' )`, which is only true once WordPress core has started
 * loading (below). Requiring the plugin here, at `muplugins_loaded`, lets the plugin's own
 * bootstrap.php load the Composer autoloader at the same point production does.
 */
function _web_plugin_manually_load_plugin(): void {
	require dirname( dirname( __DIR__ ) ) . '/wp-plugin-web.php';
}
tests_add_filter( 'muplugins_loaded', '_web_plugin_manually_load_plugin' );

// Bootstrap tests
require $wp_phpunit_dir . '/includes/bootstrap.php';
