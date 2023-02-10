<?php
/**
 * Plugin bootstrap file
 *
 * @package WPPluginCrazyDomains
 */

namespace CrazyDomains;

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
		wp_die( esc_html( __( 'Please install the Crazy Domains Plugin dependencies.', 'wp-plugin-crazy-domains' ) ) );
	}
	return;
}

/*
 * Initialize coming soon module via container
 */
$crazydomains_module_container = new Container(
	array(
		'cache_types' => array( 'browser', 'file', 'skip404' ),
	)
);

// Set plugin to container
$crazydomains_module_container->set(
	'plugin',
	$crazydomains_module_container->service(
		function() {
			return new Plugin(
				array(
					'id'   => 'crazydomains',
					'file' => CRAZYDOMAINS_PLUGIN_FILE,
				)
			);
		}
	)
);

// Set coming soon values
$crazydomains_module_container->set(
	'comingsoon',
	array(
		'admin_app_url'       => admin_url( 'admin.php?page=crazydomains#/home' ),
		'template_h1'         => __( 'Coming Soon!', 'wp-plugin-crazy-domains' ),
		'template_h2'         => __( 'A New WordPress Site', 'wp-plugin-crazy-domains' ),
		'template_footer_t'   => sprintf(
			/* translators: %1$s is replaced with opening link tag taking you to crazydomains.com/wordpress, %2$s is replaced with closing link tag, %3$s is replaced with opening link tag taking you to login page, %4$s is replaced with closing link tag, %5$s is replaced with opening link tag taking you to my.crazydomains.com, %6$s is replaced with closing link tag */
			esc_html__( 'A %1$sCrazy Domains%2$s powered website. Is this your website? Log in to %3$sWordPress%4$s or %5$sCrazy Domains%6$s.', 'wp-plugin-crazy-domains' ) . '&nbsp;',
			'<a href="' . esc_url( 'https://www.crazydomains.com/websites/wordpress' ) . '" target="_blank" rel="noopener noreferrer nofollow">',
			'</a>',
			'<a href="' . esc_url( wp_login_url() ) . '">',
			'</a>',
			'<a href="' . esc_url( 'https://www.crazydomains.com/my-account/account-center/login' ) . '" target="_blank" rel="noopener noreferrer nofollow">',
			'</a>'
		),
		'template_page_title' => sprintf(
			/* translators: %s: Blog name */
			__( '%s &mdash; Coming Soon', 'wp-plugin-crazy-domains' ),
			esc_html( get_option( 'blogname' ) )
		),
		'admin_bar_text'      => '<div style="background-color: #FEC101; color: #000; padding: 0 1rem;">' . __( 'Coming Soon Active', 'wp-plugin-crazy-domains' ) . '</div>',
		'admin_notice_text'   => sprintf(
			/* translators: %1$s is replaced with the opening link tag to preview the page, and %2$s is replaced with the closing link tag, %3$s is the opening link tag, %4$s is the closing link tag. */
			__( 'Your site is currently displaying a %1$scoming soon page%2$s. Once you are ready, %3$slaunch your site%4$s.', 'wp-plugin-crazy-domains' ),
			'<a href="' . get_home_url() . '?preview=coming_soon" title="' . __( 'Preview the coming soon landing page', 'wp-plugin-crazy-domains' ) . '">',
			'</a>',
			'<a href="' . esc_url( admin_url( 'admin.php?page=crazydomains#/home' ) ) . '">',
			'</a>'
		),
		'template_styles'     => esc_url( CRAZYDOMAINS_PLUGIN_URL . 'assets/styles/coming-soon.css' ),
	)
);
setContainer( $crazydomains_module_container );

// Set up the updater endpoint and map values
$updateurl     = 'https://hiive.cloud/workers/release-api/plugins/newfold-labs/wp-plugin-crazy-domains'; // Custom API GET endpoint
$pluginUpdater = new PluginUpdater( CRAZYDOMAINS_PLUGIN_FILE, $updateurl );
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

// Handle any upgrade routines (only in the admin)
if ( is_admin() ) {

	// Handle plugin upgrades
	$upgrade_handler = new UpgradeHandler(
		CRAZYDOMAINS_PLUGIN_DIR . '/inc/upgrades',            // Directory where upgrade routines live
		get_option( 'crazydomains_plugin_version', '1.0.0' ), // Old plugin version (from database)
		CRAZYDOMAINS_PLUGIN_VERSION                           // New plugin version (from code)
	);

	// Returns true if the old version doesn't match the new version
	$did_upgrade = $upgrade_handler->maybe_upgrade();

	if ( $did_upgrade ) {
		// If an upgrade occurred, update the new version in the database to prevent running the routine(s) again.
		update_option( 'crazydomains_plugin_version', CRAZYDOMAINS_PLUGIN_VERSION, true );
	}
}

// Required files
require CRAZYDOMAINS_PLUGIN_DIR . '/inc/Admin.php';
require CRAZYDOMAINS_PLUGIN_DIR . '/inc/AdminBar.php';
require CRAZYDOMAINS_PLUGIN_DIR . '/inc/base.php';
require CRAZYDOMAINS_PLUGIN_DIR . '/inc/jetpack.php';
require CRAZYDOMAINS_PLUGIN_DIR . '/inc/partners.php';
require CRAZYDOMAINS_PLUGIN_DIR . '/inc/performance.php';
require CRAZYDOMAINS_PLUGIN_DIR . '/inc/RestApi/CachingController.php';
require CRAZYDOMAINS_PLUGIN_DIR . '/inc/RestApi/SettingsController.php';
require CRAZYDOMAINS_PLUGIN_DIR . '/inc/RestApi/rest-api.php';
require CRAZYDOMAINS_PLUGIN_DIR . '/inc/settings.php';
require CRAZYDOMAINS_PLUGIN_DIR . '/inc/updates.php';

/* WordPress Admin Page & Features */
if ( is_admin() ) {
	new Admin();
}

AdminBar::init();
