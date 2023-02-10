<?php
/**
 * All data retrieval and saving happens from this file.
 *
 * @package WPPluginCrazyDomains
 */

namespace CrazyDomains;

/**
 * \CrazyDomains\Data
 * This class does not have a constructor to get instantiated, just static methods.
 */
final class Data {

	/**
	 * Data loaded onto window.WPPCD
	 *
	 * @return array
	 */
	public static function runtime() {
		global $wp_version;

		$runtime = array(
			'url'       => CRAZYDOMAINS_BUILD_URL,
			'version'   => CRAZYDOMAINS_PLUGIN_VERSION,
			'resturl'   => \get_home_url() . '/index.php?rest_route=',
			'wpversion' => $wp_version,
			'admin'     => \admin_url(),
			'assets'    => CRAZYDOMAINS_PLUGIN_URL . 'assets/',
		);

		return $runtime;
	}

}
