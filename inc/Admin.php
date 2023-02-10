<?php
/**
 * Register Admin page and features.
 *
 * @package WPPluginCrazyDomains
 */

namespace CrazyDomains;

/**
 * \CrazyDomains\Admin
 */
final class Admin {

	/**
	 * Register functionality using WordPress Actions.
	 */
	public function __construct() {
		/* Add Page to WordPress Admin Menu. */
		\add_action( 'admin_menu', array( __CLASS__, 'page' ) );
		/* Load Page Scripts & Styles. */
		\add_action( 'load-toplevel_page_crazydomains', array( __CLASS__, 'assets' ) );
		/* Add Links to WordPress Plugins list item. */
		\add_filter( 'plugin_action_links_wp-plugin-crazy-domains/wp-plugin-crazy-domains.php', array( __CLASS__, 'actions' ) );
		/* Add inline style to hide subnav link */
		\add_action( 'admin_head', array( __CLASS__, 'admin_nav_style' ) );

		if ( isset( $_GET['page'] ) && strpos( filter_input( INPUT_GET, 'page', FILTER_SANITIZE_STRING ), 'crazydomains' ) >= 0 ) { // phpcs:ignore
			\add_action( 'admin_footer_text', array( __CLASS__, 'add_brand_to_admin_footer' ) );
		}
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
			'crazydomains#/home'        => __( 'Home', 'wp-plugin-crazy-domains' ),
			'crazydomains#/marketplace' => __( 'Marketplace', 'wp-plugin-crazy-domains' ),
			'crazydomains#/performance' => __( 'Performance', 'wp-plugin-crazy-domains' ),
			'crazydomains#/settings'    => __( 'Settings', 'wp-plugin-crazy-domains' ),
			'crazydomains#/help'        => __( 'Help', 'wp-plugin-crazy-domains' ),
		);
	}

	/**
	 * Add inline script to admin screens
	 *  - hide extra link in subnav
	 */
	public static function admin_nav_style() {
		echo '<style>';
		echo 'li#toplevel_page_crazydomains a.toplevel_page_crazydomains div.wp-menu-image.svg { transition: fill 0.15s; background-size: 24px auto !important; }';
		echo 'ul#adminmenu a.toplevel_page_crazydomains.wp-has-current-submenu:after, ul#adminmenu>li#toplevel_page_crazydomains.current>a.current:after { border-right-color: #fff !important; }';
		echo 'li#toplevel_page_crazydomains > ul > li.wp-first-item { display: none !important; }';
		echo '#wp-toolbar #wp-admin-bar-crazydomains-coming_soon .ab-item { padding: 0; }';
		echo '</style>';
	}

	/**
	 * Add WordPress Page to Appearance submenu.
	 *
	 * @return void
	 */
	public static function page() {
		$crazydomainscom = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iMzgwLjAwMDAwMHB0IiBoZWlnaHQ9IjM4MC4wMDAwMDBwdCIgdmlld0JveD0iMCAwIDM4MC4wMDAwMDAgMzgwLjAwMDAwMCIKIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiPgo8bWV0YWRhdGE+CkNyZWF0ZWQgYnkgcG90cmFjZSAxLjExLCB3cml0dGVuIGJ5IFBldGVyIFNlbGluZ2VyIDIwMDEtMjAxMwo8L21ldGFkYXRhPgo8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLjAwMDAwMCwzODAuMDAwMDAwKSBzY2FsZSgwLjEwMDAwMCwtMC4xMDAwMDApIgpmaWxsPSIjMDAwMDAwIiBzdHJva2U9Im5vbmUiPgo8cGF0aCBkPSJNNzA1IDI2ODAgYy00MiAtMTcgLTY4IC01OCAtNjggLTEwMiAxIC0yOSA3NyAtMjUxIDIzNyAtNjk2IDEzMAotMzU5IDI0MiAtNjY1IDI1MSAtNjgxIDI1IC00OSA2MiAtNzEgMTE3IC03MSA5MCAwIDk1IDEwIDI0MyA0NDAgMjc4IDgxMCAyNjIKNzY3IDI3MyA3NDAgNSAtMTQgOTQgLTI3MiAxOTggLTU3NSAyMTAgLTYxMiAyMDYgLTYwNSAyOTAgLTYwNSA1NiAwIDkwIDE2CjExMyA1NCAxMSAxNyA4NyAyMjAgMTcxIDQ1MSA4MyAyMzEgMTkwIDUyNiAyMzcgNjU1IDQ3IDEyOSA4OCAyNTQgOTEgMjc3IDYKNTMgLTE1IDg5IC02NiAxMTAgLTQ1IDE5IC0xMDQgNCAtMTI4IC0zMSAtOCAtMTMgLTc2IC0yMDMgLTE1MCAtNDIyIC03NSAtMjIwCi0xNjQgLTQ4MiAtMTk5IC01ODQgLTM1IC0xMDIgLTY2IC0xNzggLTY5IC0xNzAgLTMgOCAtNjcgMjAyIC0xNDEgNDMwIC03NQoyMjggLTE1OSA0ODQgLTE4NyA1NjggLTI5IDg5IC02MCAxNjUgLTc0IDE4MiAtNDYgNTQgLTE1NiA0OCAtMTkyIC0xMSAtNyAtMTEKLTEwMSAtMjgwIC0yMDggLTU5NyAtMTA3IC0zMTYgLTE5NiAtNTc3IC0xOTggLTU3OSAtMiAtMiAtOTAgMjU0IC0xOTYgNTY5Ci0xMDYgMzE1IC0yMDEgNTg3IC0yMTIgNjA1IC0yNiA0NCAtODUgNjMgLTEzMyA0M3oiLz4KPHBhdGggZD0iTTI5NDUgMTQ0NSBjLTEyMCAtNDMgLTE1MSAtMTgxIC02MSAtMjcxIDQ2IC00NiA5MSAtNjEgMTUzIC00OSA0OSA5CjEwOCA2OCAxMjIgMTIzIDM1IDEyNyAtOTAgMjQyIC0yMTQgMTk3eiIvPgo8L2c+Cjwvc3ZnPgo=';

		\add_menu_page(
			__( 'Crazy Domains', 'wp-plugin-crazy-domains' ),
			__( 'Crazy Domains', 'wp-plugin-crazy-domains' ),
			'manage_options',
			'crazydomains',
			array( __CLASS__, 'render' ),
			$crazydomainscom,
			0
		);

		foreach ( self::subpages() as $route => $title ) {
			\add_submenu_page(
				'crazydomains',
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

		echo '<!-- Crazy Domains -->' . PHP_EOL;

		if ( version_compare( $wp_version, '5.4', '>=' ) ) {
			echo '<div id="wppcd-app" class="wppcd wppcd_app"></div>' . PHP_EOL;
		} else {
			// fallback messaging for WordPress older than 5.4
			echo '<div id="wppcd-app" class="wppcd wppcd_app">' . PHP_EOL;
			echo '<header class="wppcd-header" style="min-height: 90px; padding: 1rem; margin-bottom: 1.5rem;"><div class="wppcd-header-inner"><div class="wppcd-logo-wrap">' . PHP_EOL;
			echo '<img src="' . esc_url( CRAZYDOMAINS_PLUGIN_URL . 'assets/svg/crazydomains-logo.svg' ) . '" alt="Crazy Domains logo" />' . PHP_EOL;
			echo '</div></div></header>' . PHP_EOL;
			echo '<div class="wrap">' . PHP_EOL;
			echo '<div class="card" style="margin-left: 20px;"><h2 class="title">' . esc_html__( 'Please update to a newer WordPress version.', 'wp-plugin-crazy-domains' ) . '</h2>' . PHP_EOL;
			echo '<p>' . esc_html__( 'There are new WordPress components which this plugin requires in order to render the interface.', 'wp-plugin-crazy-domains' ) . '</p>' . PHP_EOL;
			echo '<p><a href="' . esc_url( admin_url( 'update-core.php' ) ) . '" class="button component-button is-primary button-primary" variant="primary">' . esc_html__( 'Please update now', 'wp-plugin-crazy-domains' ) . '</a></p>' . PHP_EOL;
			echo '</div></div></div>' . PHP_EOL;
		}

		echo '<!-- /Crazy Domains -->' . PHP_EOL;
	}

	/**
	 * Load Page Scripts & Styles.
	 *
	 * @return void
	 */
	public static function assets() {
		$asset_file = CRAZYDOMAINS_BUILD_DIR . '/index.asset.php';

		if ( is_readable( $asset_file ) ) {
			$asset = include_once $asset_file;
		} else {
			return;
		}

		\wp_register_script(
			'crazydomains-script',
			CRAZYDOMAINS_BUILD_URL . '/index.js',
			array_merge( $asset['dependencies'] ),
			$asset['version'],
			true
		);

		include CRAZYDOMAINS_PLUGIN_DIR . '/inc/Data.php';
		\wp_add_inline_script(
			'crazydomains-script',
			'var WPPCD =' . \wp_json_encode( Data::runtime() ) . ';',
			'before'
		);

		\wp_register_style(
			'crazydomains-style',
			CRAZYDOMAINS_BUILD_URL . '/index.css',
			array( 'wp-components' ),
			$asset['version']
		);

		$screen = get_current_screen();
		if ( false !== strpos( $screen->id, 'crazydomains' ) ) {
			\wp_enqueue_script( 'crazydomains-script' );
			\wp_enqueue_style( 'crazydomains-style' );
		}
	}

	/**
	 * Add Links to WordPress Plugins list item for Crazy Domains.
	 *
	 * @param  array $actions - array of action links for Plugin row item.
	 * @return array
	 */
	public static function actions( $actions ) {
		return array_merge(
			array(
				'overview' => '<a href="' . \admin_url( 'admin.php?page=crazydomains#/home' ) . '">' . __( 'Home', 'wp-plugin-crazy-domains' ) . '</a>',
				'settings' => '<a href="' . \admin_url( 'admin.php?page=crazydomains#/settings' ) . '">' . __( 'Settings', 'wp-plugin-crazy-domains' ) . '</a>',
			),
			$actions
		);
	}

	/**
	 * Filter WordPress Admin Footer Text "Thank you for creating with..."
	 *
	 * @param string $footer_text footer text
	 * @return string
	 */
	public static function add_brand_to_admin_footer( $footer_text ) {
		$footer_text = \sprintf( \__( 'Thank you for creating with <a href="https://wordpress.org/">WordPress</a> and <a href="https://crazydomains.com/about-us">Crazy Domains</a>.', 'wp-plugin-crazy-domains' ) );
		return $footer_text;
	}
} // END \CrazyDomains\Admin
