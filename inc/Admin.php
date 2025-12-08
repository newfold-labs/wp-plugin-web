<?php
/**
 * Register Admin page and features.
 *
 * @package WPPluginWeb
 */

namespace Web;

use Web\Data;
use function NewfoldLabs\WP\Module\Features\isEnabled;

/**
 * \Web\Admin
 */
final class Admin {

	/**
	 * Register functionality using WordPress Actions.
	 */
	public function __construct() {
		/* Add Page to WordPress Admin Menu. */
		\add_action( 'admin_menu', array( __CLASS__, 'page' ) );
		/* Load Page Scripts & Styles. */
		\add_action( 'load-toplevel_page_web', array( __CLASS__, 'assets' ) );
		/* Add Links to WordPress Plugins list item. */
		\add_filter( 'plugin_action_links_wp-plugin-web/wp-plugin-web.php', array( __CLASS__, 'actions' ) );
		/* Add inline style to hide subnav link */
		\add_action( 'admin_head', array( __CLASS__, 'admin_nav_style' ) );
		/* Add runtime for data store */
		\add_filter( 'newfold_runtime', array( __CLASS__, 'add_to_runtime' ) );

		if ( isset( $_GET['page'] ) && strpos( filter_input( INPUT_GET, 'page', FILTER_UNSAFE_RAW ), 'web' ) >= 0 ) { // phpcs:ignore
			\add_action( 'admin_footer_text', array( __CLASS__, 'add_brand_to_admin_footer' ) );
		}
	}

	/**
	 * Add to runtime
	 *
	 * @param array $sdk - runtime properties from module.
	 *
	 * @return array
	 */
	public static function add_to_runtime( $sdk ) {
		include WEB_PLUGIN_DIR . '/inc/Data.php';
		return array_merge( $sdk, Data::runtime() );
	}

	/**
	 * Subpages to register with add_submenu_page().
	 *
	 * Order or array items determines menu order.
	 *
	 * @return array
	 */
	public static function subpages() {

		return array(
			'web#/home'        => __( 'Home', 'wp-plugin-web' ),
			'web#/marketplace' => __( 'Marketplace', 'wp-plugin-web' ),
			'web#/settings'    => __( 'Settings', 'wp-plugin-web' ),
			'web#/help'        => __( 'Help', 'wp-plugin-web' ),
		);
	}

	/**
	 * Add inline script to admin screens
	 *  - hide extra link in subnav
	 */
	public static function admin_nav_style() {
		echo '<style>';
		echo 'li#toplevel_page_web a.toplevel_page_web div.wp-menu-image.svg { transition: fill 0.15s; background-size: 24px auto !important; }';
		echo 'li#toplevel_page_web a.toplevel_page_web div.wp-menu-name {
		    padding: 8px 2px 8px 29px;
			font-size: 12px;
		}';
		echo 'li#toplevel_page_web a.toplevel_page_web div.wp-menu-image img {
			padding: 6px 8px 0px;
			opacity: 1 !important;
			display: block;
		}';
		echo 'ul#adminmenu a.toplevel_page_web.wp-has-current-submenu:after, ul#adminmenu>li#toplevel_page_web.current>a.current:after { border-right-color: #fff !important; }';
		echo 'li#toplevel_page_web > ul > li.wp-first-item { display: none !important; }';
		echo '#wp-toolbar #wp-admin-bar-web-coming_soon .ab-item { padding: 0; }';
		echo '</style>';
	}

	/**
	 * Add WordPress Page to Appearance submenu.
	 *
	 * @return void
	 */
	public static function page() {
		$iconurl = WEB_PLUGIN_URL . 'assets/svg/ns-icon-image.svg';
		$iconurl = \add_query_arg( 'ver', WEB_PLUGIN_VERSION, $iconurl );

		\add_menu_page(
			__( 'Network Solutions', 'wp-plugin-web' ),
			__( 'Network Solutions', 'wp-plugin-web' ),
			'manage_options',
			'web',
			array( __CLASS__, 'render' ),
			$iconurl,
			0
		);

		// Add subpages to the menu
		foreach ( self::subpages() as $route => $title ) {
			\add_submenu_page(
				'web',
				$title,
				$title,
				'manage_options',
				$route,
				array( __CLASS__, 'render' )
			);
		}
	}

	/**
	 * Render DOM element for React to load onto.
	 *
	 * @return void
	 */
	public static function render() {
		global $wp_version;

		echo '<!-- Web.com -->' . PHP_EOL;

		if ( version_compare( $wp_version, '5.4', '>=' ) ) {
			echo '<div id="wppw-app" class="wppw wppw_app"></div>' . PHP_EOL;
			// Render bootstrap containers for modules that need portals
			// Only enabled features get their containers rendered
			$features_with_portals = array( 'performance' );
			foreach ( $features_with_portals as $feature ) {
				if ( function_exists( 'NewfoldLabs\WP\Module\Features\isEnabled' ) &&
					\NewfoldLabs\WP\Module\Features\isEnabled( $feature ) ) {
					$portal_id = 'nfd-' . $feature . '-portal';
					echo '<div id="' . esc_attr( $portal_id ) . '" style="display:none"></div>' . PHP_EOL;
				}
			}
		} else {
			// fallback messaging for WordPress older than 5.4.
			echo '<div id="wppw-app" class="wppw wppw_app">' . PHP_EOL;
			echo '<header class="wppw-header" style="min-height: 90px; padding: 1rem; margin-bottom: 1.5rem;"><div class="wppw-header-inner"><div class="wppw-logo-wrap">' . PHP_EOL;
			echo '<img src="' . esc_url( WEB_PLUGIN_URL . 'assets/svg/ns-logo.svg' ) . '" alt="Network Solutions logo" />' . PHP_EOL;
			echo '</div></div></header>' . PHP_EOL;
			echo '<div class="wrap">' . PHP_EOL;
			echo '<div class="card" style="margin-left: 20px;"><h2 class="title">' . esc_html__( 'Please update to a newer WordPress version.', 'wp-plugin-web' ) . '</h2>' . PHP_EOL;
			echo '<p>' . esc_html__( 'There are new WordPress components which this plugin requires in order to render the interface.', 'wp-plugin-web' ) . '</p>' . PHP_EOL;
			echo '<p><a href="' . esc_url( admin_url( 'update-core.php' ) ) . '" class="button component-button is-primary button-primary" variant="primary">' . esc_html__( 'Please update now', 'wp-plugin-web' ) . '</a></p>' . PHP_EOL;
			echo '</div></div></div>' . PHP_EOL;
		}

		echo '<!-- /Web.com -->' . PHP_EOL;
	}

	/**
	 * Load Page Scripts & Styles.
	 *
	 * @return void
	 */
	public static function assets() {
		$asset_file = WEB_BUILD_DIR . '/index.asset.php';

		if ( is_readable( $asset_file ) ) {
			$asset = include_once $asset_file;
		} else {
			return;
		}

		\wp_register_script(
			'web-script',
			WEB_BUILD_URL . '/index.js',
			array_merge( $asset['dependencies'], array( 'newfold-features', 'nfd-runtime' ) ),
			$asset['version'],
			true
		);

		\wp_register_style(
			'web-style',
			WEB_BUILD_URL . '/index.css',
			array( 'wp-components' ),
			$asset['version']
		);

		$screen = get_current_screen();
		if ( false !== strpos( $screen->id, 'web' ) ) {
			\wp_enqueue_script( 'web-script' );
			\wp_enqueue_style( 'web-style' );
		}
	}

	/**
	 * Add Links to WordPress Plugins list item for Web.com.
	 *
	 * @param  array $actions - array of action links for Plugin row item.
	 * @return array
	 */
	public static function actions( $actions ) {
		return array_merge(
			array(
				'overview' => '<a href="' . \apply_filters( 'nfd_build_url', admin_url( 'admin.php?page=web#/home' ) ) . '">' . __( 'Home', 'wp-plugin-web' ) . '</a>',
				'settings' => '<a href="' . \apply_filters( 'nfd_build_url', admin_url( 'admin.php?page=web#/settings' ) ) . '">' . __( 'Settings', 'wp-plugin-web' ) . '</a>',
			),
			$actions
		);
	}

	/**
	 * Filter WordPress Admin Footer Text "Thank you for creating with..."
	 *
	 * @param string $footer_text footer text.
	 * @return string
	 */
	public static function add_brand_to_admin_footer( $footer_text ) {

		$wordpress_url = '<a href="' . apply_filters( 'nfd_build_url', 'https://wordpress.org/', array( 'source' => 'web_admin_footer' ) ) . '">WordPress</a>';
		$web_url       = '<a href="' . apply_filters( 'nfd_build_url', 'https://www.networksolutions.com/', array( 'source' => 'web_admin_footer' ) ) . '">Network Solutions</a>';

		// translators: %1$s is the WordPress URL, %2$s is the Web.com URL.
		$footer_text = sprintf( \__( 'Thank you for creating with %1$s and %2$s', 'wp-plugin-web' ), $wordpress_url, $web_url );

		return $footer_text;
	}
} // END \Web\Admin
