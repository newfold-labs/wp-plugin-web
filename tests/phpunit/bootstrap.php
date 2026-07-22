<?php
/**
 * PHPUnit bootstrap for the Network Solutions plugin.
 *
 * @package WPPluginWeb
 */

// Load up Composer dependencies
require dirname( dirname( __DIR__ ) ) . '/vendor/autoload.php';

$wp_phpunit_dir = getenv( 'WP_PHPUNIT__DIR' );

require_once $wp_phpunit_dir . '/includes/functions.php';

/**
 * Load the plugin under test the same way WordPress would load a regular plugin,
 * i.e. before the `plugins_loaded` action fires.
 */
function _web_plugin_manually_load_plugin(): void {
	require dirname( dirname( __DIR__ ) ) . '/wp-plugin-web.php';
}
tests_add_filter( 'muplugins_loaded', '_web_plugin_manually_load_plugin' );

// Bootstrap tests
require $wp_phpunit_dir . '/includes/bootstrap.php';
