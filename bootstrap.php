<?php
/**
 * Plugin bootstrap file
 *
 * @package WPPluginWeb
 */

namespace Web;

use Web\UpgradeHandler;
use WP_Forge\WPUpdateHandler\PluginUpdater;

// Composer autoloader
if ( is_readable( __DIR__ . '/vendor/autoload.php' ) ) {
	require __DIR__ . '/vendor/autoload.php';
} else {
	if ( 'local' === wp_get_environment_type() ) {
		wp_die( esc_html( __( 'Please install the Web.com Plugin dependencies.', 'wp-plugin-web' ) ) );
	}
	return;
}
$updateurl     = 'https://hiive.cloud/workers/release-api/plugins/newfold-labs/wp-plugin-web'; // Custom API GET endpoint
$pluginUpdater = new PluginUpdater( WEB_PLUGIN_FILE, $updateurl );
$pluginUpdater->setDataMap(
	array(
		'version'       => 'version.latest',
		'download_link' => 'download',
		'last_updated'  => 'updated',
		'requires'      => 'requires.wp',
		'requires_php'  => 'requires.php',
		'tested'        => 'tested.wp',
	)
);

// Handle any upgrade routines
if ( is_admin() ) {

	// Handle plugin upgrades
	require WEB_PLUGIN_DIR . '/inc/UpgradeHandler.php';
	$upgrade_handler = new UpgradeHandler(
		WEB_PLUGIN_DIR . '/inc/upgrades',
		get_option( 'web_plugin_version', '1.0' ),
		WEB_PLUGIN_VERSION
	);

	$did_upgrade = $upgrade_handler->maybe_upgrade();
	if ( $did_upgrade ) {
		update_option( 'web_plugin_version', WEB_PLUGIN_VERSION, true );
	}
}

// Required files
require WEB_PLUGIN_DIR . '/inc/Admin.php';
require WEB_PLUGIN_DIR . '/inc/AdminBar.php';
require WEB_PLUGIN_DIR . '/inc/base.php';
require WEB_PLUGIN_DIR . '/inc/coming-soon.php';
require WEB_PLUGIN_DIR . '/inc/jetpack.php';
require WEB_PLUGIN_DIR . '/inc/partners.php';
require WEB_PLUGIN_DIR . '/inc/performance.php';
require WEB_PLUGIN_DIR . '/inc/RestApi/CachingController.php';
require WEB_PLUGIN_DIR . '/inc/RestApi/SettingsController.php';
require WEB_PLUGIN_DIR . '/inc/RestApi/rest-api.php';
require WEB_PLUGIN_DIR . '/inc/settings.php';
require WEB_PLUGIN_DIR . '/inc/updates.php';

/* WordPress Admin Page & Features */
if ( is_admin() ) {
	new Admin();
}

AdminBar::init();
