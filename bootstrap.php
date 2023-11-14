<?php
/**
 * Plugin bootstrap file
 *
 * @package WPPluginWeb
 */

namespace Web;

use WP_Forge\WPUpdateHandler\PluginUpdater;
use WP_Forge\UpgradeHandler\UpgradeHandler;
use NewfoldLabs\WP\ModuleLoader\Container;
use NewfoldLabs\WP\ModuleLoader\Plugin;
use function NewfoldLabs\WP\ModuleLoader\container as setContainer;

// Composer autoloader
if ( is_readable( __DIR__ . '/vendor/autoload.php' ) ) {
	require __DIR__ . '/vendor/autoload.php';
} else {
	if ( 'local' === wp_get_environment_type() ) {
		wp_die( esc_html( __( 'Please install the Web.com Plugin dependencies.', 'wp-plugin-web' ) ) );
	}
	return;
}

/*
 * Initialize coming soon module via container
 */
$web_module_container = new Container(
	array(
		'cache_types' => array( 'browser', 'file', 'skip404' ),
	)
);

// Set plugin to container
$web_module_container->set(
	'plugin',
	$web_module_container->service(
		function() {
			return new Plugin(
				array(
					'id'           => 'web',
					'file'         => WEB_PLUGIN_FILE,
					'brand'        => get_option( 'mm_brand', 'web' ),
					'install_date' => get_option( 'web_plugin_install_date' ),
				)
			);
		}
	)
);

// Set coming soon values
$web_module_container->set(
	'comingsoon',
	array(
		'admin_app_url'       => admin_url( 'admin.php?page=web#/home' ),
		'template_h1'         => __( 'Coming Soon!', 'wp-plugin-web' ),
		'template_h2'         => __( 'A New WordPress Site', 'wp-plugin-web' ),
		'template_footer_t'   => sprintf(
			/* translators: %1$s is replaced with opening link tag taking you to web.com/wordpress, %2$s is replaced with closing link tag, %3$s is replaced with opening link tag taking you to login page, %4$s is replaced with closing link tag, %5$s is replaced with opening link tag taking you to my.web.com, %6$s is replaced with closing link tag */
			esc_html__( 'A %1$sWeb.com%2$s powered website. Is this your website? Log in to %3$sWordPress%4$s or %5$sWeb.com%6$s.', 'wp-plugin-web' ) . '&nbsp;',
			'<a href="' . esc_url( 'https://www.web.com/websites/wordpress' ) . '" target="_blank" rel="noopener noreferrer nofollow">',
			'</a>',
			'<a href="' . esc_url( wp_login_url() ) . '">',
			'</a>',
			'<a href="' . esc_url( 'https://www.web.com/my-account/account-center/login' ) . '" target="_blank" rel="noopener noreferrer nofollow">',
			'</a>'
		),
		'template_page_title' => sprintf(
			/* translators: %s: Blog name */
			__( '%s &mdash; Coming Soon', 'wp-plugin-web' ),
			esc_html( get_option( 'blogname' ) )
		),
		'admin_bar_text'      => '<div style="background-color: #FEC101; color: #000; padding: 0 1rem;">' . __( 'Coming Soon Active', 'wp-plugin-web' ) . '</div>',
		'admin_notice_text'   => sprintf(
			/* translators: %1$s is replaced with the opening link tag to preview the page, and %2$s is replaced with the closing link tag, %3$s is the opening link tag, %4$s is the closing link tag. */
			__( 'Your site is currently displaying a %1$scoming soon page%2$s. Once you are ready, %3$slaunch your site%4$s.', 'wp-plugin-web' ),
			'<a href="' . get_home_url() . '?preview=coming_soon" title="' . __( 'Preview the coming soon landing page', 'wp-plugin-web' ) . '">',
			'</a>',
			'<a href="' . esc_url( admin_url( 'admin.php?page=web#/home' ) ) . '">',
			'</a>'
		),
		'template_styles'     => esc_url( WEB_PLUGIN_URL . 'assets/styles/coming-soon.css' ),
	)
);
setContainer( $web_module_container );

// Set up the updater endpoint and map values
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
$pluginUpdater->setDataOverrides(
	[
		'banners' => [
			'2x' => 'https://cdn.hiive.space/marketplace/vendors-assets/web-banner.svg',
			'1x' => 'https://cdn.hiive.space/marketplace/vendors-assets/web-banner.svg',
		],
		'icons' => [
			'2x' => 'https://cdn.hiive.space/marketplace/vendors-assets/web-icon.svg',
			'1x' => 'https://cdn.hiive.space/marketplace/vendors-assets/web-icon.svg',
		],
	]
);

// Handle any upgrade routines (only in the admin)
if ( is_admin() ) {

	// Handle plugin upgrades
	$upgrade_handler = new UpgradeHandler(
		WEB_PLUGIN_DIR . '/inc/upgrades',            // Directory where upgrade routines live
		get_option( 'web_plugin_version', '0.9.0' ), // Old plugin version (from database)
		WEB_PLUGIN_VERSION                           // New plugin version (from code)
	);

	// Returns true if the old version doesn't match the new version
	$did_upgrade = $upgrade_handler->maybe_upgrade();

	if ( $did_upgrade ) {
		// If an upgrade occurred, update the new version in the database to prevent running the routine(s) again.
		update_option( 'web_plugin_version', WEB_PLUGIN_VERSION, true );
	}
}

// Required files
require WEB_PLUGIN_DIR . '/inc/Admin.php';
require WEB_PLUGIN_DIR . '/inc/AdminBar.php';
require WEB_PLUGIN_DIR . '/inc/base.php';
require WEB_PLUGIN_DIR . '/inc/jetpack.php';
require WEB_PLUGIN_DIR . '/inc/partners.php';
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


/**
 * Filter to add applicable BN code to paypal requests
 *
 * https://github.com/newfold-labs/wp-module-ecommerce/blob/trunk/bootstrap.php#L62-L101
 */
if ( function_exists( 'add_filter' ) ) {
	add_filter(
		'http_request_args',
		function ( $parsed_args, $url ) {

			// Bail early if the request is not to PayPal's v2 checkout API
			if ( false === stripos( wp_parse_url( $url, PHP_URL_HOST ), 'paypal.com' ) ) {
				return $parsed_args;
			}

			// Check for an existing bn_code
			$bn_code = isset( $parsed_args['headers']['PayPal-Partner-Attribution-Id'] ) ? $parsed_args['headers']['PayPal-Partner-Attribution-Id'] : null;

			// Ensure we only set when blank, or when using one of our stale codes
			if ( is_null( $bn_code ) || false !== stripos( $bn_code, 'yith' ) || false !== stripos( $bn_code, 'newfold' ) ) {
				// The correct code is case-sensitive. YITH brand is uppercase, but the code is not.
				$parsed_args['headers']['PayPal-Partner-Attribution-Id'] = 'Yith_PCP';
			}

			return $parsed_args;
		},
		10,
		2
	);

	add_filter(
		'script_loader_tag',
		function ( $tag, $handle, $source ) {
			if ( stripos( $source, 'paypal.com/sdk' ) !== false ) {
				$replacement = ' data-partner-attribution-id="Yith_PCP"';
				if ( stripos( $tag, 'partner-attribution-id' ) === false ) {
					$tag = str_replace( ' src=', $replacement . ' src=', $tag );
				} else if ( stripos( $tag, 'NEWFOLD' ) || stripos( $tag, 'YITH' ) ) {
					$tag = preg_replace( '/ data-partner-attribution-id="(.*?)"/', $replacement, $tag );
				}
			}
			return $tag;
		},
		25,
		3
	);
}