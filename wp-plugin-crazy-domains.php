<?php
/**
 * Crazy Domains WordPress Plugin
 *
 * @package           WPPluginCrazyDomains
 * @author            Newfold Digital
 * @copyright         Copyright 2023 by Newfold Digital - All rights reserved.
 * @license           GPL-2.0-or-later
 *
 * @wordpress-plugin
 * Plugin Name:       The Crazy Domains Plugin
 * Plugin URI:        https://crazydomains.com
 * Description:       WordPress plugin that integrates a WordPress site with the Crazy Domains control panel, including performance, security, and update features.
 * Version:           1.0.0
 * Requires at least: 4.7
 * Requires PHP:      5.6
 * Tested up to:      6.1.1
 * Author:            Crazy Domains
 * Author URI:        https://crazydomains.com
 * Text Domain:       wp-plugin-crazy-domains
 * Domain Path:       /languages
 * License:           GPL 2.0 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 */

namespace CrazyDomains;

// Do not allow multiple copies of the Crazy Domains Plugin to be active
if ( defined( 'CRAZYDOMAINS_PLUGIN_VERSION' ) ) {
	exit;
}

// Define constants
define( 'CRAZYDOMAINS_PLUGIN_VERSION', '1.0.0' );
define( 'CRAZYDOMAINS_PLUGIN_FILE', __FILE__ );
define( 'CRAZYDOMAINS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'CRAZYDOMAINS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
if ( ! defined( 'NFD_HIIVE_URL' ) ) {
	define( 'NFD_HIIVE_URL', 'https://hiive.cloud/api' );
}

define( 'CRAZYDOMAINS_BUILD_DIR', CRAZYDOMAINS_PLUGIN_DIR . 'build/' . CRAZYDOMAINS_PLUGIN_VERSION );
define( 'CRAZYDOMAINS_BUILD_URL', CRAZYDOMAINS_PLUGIN_URL . 'build/' . CRAZYDOMAINS_PLUGIN_VERSION );

global $pagenow;
if ( 'plugins.php' === $pagenow ) {

	require CRAZYDOMAINS_PLUGIN_DIR . '/inc/plugin-php-compat-check.php';

	$plugin_check = new Plugin_PHP_Compat_Check( __FILE__ );

	$plugin_check->min_php_version = '5.3';
	$plugin_check->min_wp_version  = '4.7';

	$plugin_check->check_plugin_requirements();
}

// Check NFD plugin incompatibilities
require_once CRAZYDOMAINS_PLUGIN_DIR . '/inc/plugin-nfd-compat-check.php';
$nfd_plugins_check = new NFD_Plugin_Compat_Check( CRAZYDOMAINS_PLUGIN_FILE );
// Defer to Incompatible plugin, self-deactivate
$nfd_plugins_check->incompatible_plugins = array(
	'The Bluehost Plugin' => 'bluehost-wordpress-plugin/bluehost-wordpress-plugin.php',
);
// Deactivate legacy plugin
$nfd_plugins_check->legacy_plugins = array(
	'The MOJO Marketplace' => 'mojo-marketplace-wp-plugin/mojo-marketplace.php',
	'The MOJO Plugin'      => 'wp-plugin-mojo/wp-plugin-mojo.php',
	'The HostGator Plugin' => 'wp-plugin-hostgator/wp-plugin-hostgator.php',
	'The Web.com Plugin'   => 'wp-plugin-web/wp-plugin-web.php',
);
$pass_nfd_check = $nfd_plugins_check->check_plugin_requirements();

// Check PHP version before initializing to prevent errors if plugin is incompatible.
if ( $pass_nfd_check && version_compare( PHP_VERSION, '5.3', '>=' ) ) {
	require dirname( __FILE__ ) . '/bootstrap.php';
}
