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
	 * Data loaded onto window.NewfoldRuntime
	 *
	 * @return array
	 */
	public static function runtime() {
		global $web_module_container;

		$runtime = array(
			'url'     => WEB_BUILD_URL,
			'version' => WEB_PLUGIN_VERSION,
			'assets'  => WEB_PLUGIN_URL . 'assets/',
			'brand'   => $web_module_container->plugin()->brand,
		);

		return $runtime;
	}

}
