<?php
/**
 * All data retrieval and saving happens from this file.
 *
 * @package WPPluginWeb
 */

namespace Web;

/**
 * \Web\Data
 * This class does not have a constructor to get instantiated, just static methods.
 */
final class Data {

	/**
	 * AI SiteGen brand identifier for Network Solutions family.
	 *
	 * @var string
	 */
	private static $ai_sitegen_brand = 'networksolutions';

	/**
	 * Data loaded onto window.NewfoldRuntime
	 *
	 * @return array
	 */
	public static function runtime() {
		global $web_module_container;
		$runtime = array(
			'plugin' => array(
				'url'     => WEB_BUILD_URL,
				'version' => WEB_PLUGIN_VERSION,
				'assets'  => WEB_PLUGIN_URL . 'assets/',
				'brand'   => $web_module_container->plugin()->brand,
			),
			'siteType'           => self::get_site_type(),
		);
		return $runtime;
	}

	/**
	 * Get the AI SiteGen brand identifier for Network Solutions family.
	 *
	 * This method is called by the newfold_ai_sitegen_brand filter to determine
	 * which brand identifier to use for AI SiteGen API requests.
	 *
	 * @return string The parent brand identifier to use for AI SiteGen API requests.
	 */
	public static function get_ai_sitegen_brand() {
		return self::$ai_sitegen_brand;
	}

	/**
	 * Get site type from onboarding data
	 *
	 * @return string The site type
	 */
	public static function get_site_type() {
		// Option name for onboarding site info
		$ONBOARDING_SITE_INFO_OPTION = 'nfd_module_onboarding_site_info';

		/**
		 * Available plan types, this maps the site_type from onboarding module to internal plan types
		 * Maps the site_type to the site type for the runtime data
		 */
		$SITE_TYPES = array(
			'personal'  => 'blog',
			'business'  => 'website',
			'ecommerce' => 'store',
		);

		if ( is_plugin_active( 'woocommerce/woocommerce.php' ) ) {
			return 'store';
		}

		$onboarding_data = \get_option( $ONBOARDING_SITE_INFO_OPTION, array() );
		$site_type       = $onboarding_data[ 'site_type' ] ?? '';
		if ( ! empty( $site_type ) && \array_key_exists( $site_type, $SITE_TYPES ) ) {
			return $SITE_TYPES[ $site_type ];
		}

		return 'website';
	}
}
