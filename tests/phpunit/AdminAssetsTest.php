<?php
/**
 * Smoke tests for Web\Admin asset registration without a built JS bundle.
 *
 * @package WPPluginWeb
 */

use Web\Admin;

/**
 * Class AdminAssetsTest
 */
class AdminAssetsTest extends WP_UnitTestCase {

	public function set_up() {
		parent::set_up();

		// Admin::assets() reads get_current_screen(), which is only populated in an admin context.
		set_current_screen( 'dashboard' );
	}

	public function tear_down() {
		wp_deregister_script( 'web-script' );
		wp_deregister_script( 'nfd-portal-registry' );
		wp_deregister_style( 'web-style' );

		parent::tear_down();
	}

	/**
	 * WEB_BUILD_DIR points at a real, versioned build folder that only exists after `npm run build`.
	 * In a fresh checkout (or CI without a JS build step) `index.asset.php` won't exist, so this
	 * asserts Admin::assets() falls back gracefully instead of leaving $asset undefined.
	 */
	public function test_assets_does_not_fatal_without_built_bundle() {
		$this->assertFileDoesNotExist( WEB_BUILD_DIR . '/index.asset.php' );

		Admin::assets();

		$this->assertTrue( wp_script_is( 'web-script', 'registered' ) );
		$this->assertTrue( wp_style_is( 'web-style', 'registered' ) );
	}
}
