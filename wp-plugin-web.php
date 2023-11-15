<?php
/**
 * Web.com WordPress Plugin
 *
 * @package           WPPluginWeb
 * @author            Newfold Digital
 * @copyright         Copyright 2023 by Newfold Digital - All rights reserved.
 * @license           GPL-2.0-or-later
 *
 * @wordpress-plugin
 * Plugin Name:       The Web.com Plugin
 * Plugin URI:        https://web.com
 * Update URI:        https://github.com/newfold-labs/wp-plugin-web/
 * Description:       WordPress plugin that integrates a WordPress site with the Web.com control panel, including performance, security, and update features.
 * Version:           2.0.0
 * Requires at least: 4.7
 * Requires PHP:      5.6
 * Tested up to:      6.4.1
 * Author:            Web.com
 * Author URI:        https://web.com
 * Text Domain:       wp-plugin-web
 * Domain Path:       /languages
 * License:           GPL 2.0 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 */

namespace Web;

// Do not allow multiple copies of the Web Plugin to be active
if ( defined( 'WEB_PLUGIN_VERSION' ) ) {
	exit;
}

// Define constants
define( 'WEB_PLUGIN_VERSION', '2.0.0' );
define( 'WEB_PLUGIN_FILE', __FILE__ );
define( 'WEB_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'WEB_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
if ( ! defined( 'NFD_HIIVE_URL' ) ) {
	define( 'NFD_HIIVE_URL', 'https://hiive.cloud/api' );
}

define( 'WEB_BUILD_DIR', WEB_PLUGIN_DIR . 'build/' . WEB_PLUGIN_VERSION );
define( 'WEB_BUILD_URL', WEB_PLUGIN_URL . 'build/' . WEB_PLUGIN_VERSION );

global $pagenow;
if ( 'plugins.php' === $pagenow ) {

	require WEB_PLUGIN_DIR . '/inc/plugin-php-compat-check.php';

	$plugin_check = new Plugin_PHP_Compat_Check( __FILE__ );

	$plugin_check->min_php_version = '5.3';
	$plugin_check->min_wp_version  = '4.7';

	$plugin_check->check_plugin_requirements();
}

// Check NFD plugin incompatibilities
require_once WEB_PLUGIN_DIR . '/inc/plugin-nfd-compat-check.php';
$nfd_plugins_check = new NFD_Plugin_Compat_Check( WEB_PLUGIN_FILE );
// Defer to Incompatible plugin, self-deactivate
$nfd_plugins_check->incompatible_plugins = array(
	'The Bluehost Plugin' => 'bluehost-wordpress-plugin/bluehost-wordpress-plugin.php',
);
// Deactivate legacy plugin
$nfd_plugins_check->legacy_plugins = array(
	'The MOJO Marketplace' => 'mojo-marketplace-wp-plugin/mojo-marketplace.php',
	'The MOJO Plugin'      => 'wp-plugin-mojo/wp-plugin-mojo.php',
	'The HostGator Plugin' => 'wp-plugin-hostgator/wp-plugin-hostgator.php',
);
$pass_nfd_check = $nfd_plugins_check->check_plugin_requirements();

// Check PHP version before initializing to prevent errors if plugin is incompatible.
if ( $pass_nfd_check && version_compare( PHP_VERSION, '5.3', '>=' ) ) {
	require dirname( __FILE__ ) . '/bootstrap.php';
}
