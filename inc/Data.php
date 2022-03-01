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
	 * Data loaded onto window.WPPW
	 *
	 * @return array
	 */
	public static function runtime() {
		global $wp_version;

		$runtime = array(
			'url'       => WEB_BUILD_URL,
			'version'   => WEB_PLUGIN_VERSION,
			'resturl'   => \get_home_url() . '/index.php?rest_route=',
			'wpversion' => $wp_version,
			'admin'     => \admin_url(),
			'assets'    => WEB_PLUGIN_URL . 'assets/',
		);

		return $runtime;
	}

}
