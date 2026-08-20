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

	private string $asset_file;
	private string $asset_file_backup;
	private bool $moved_asset_file = false;

	public function set_up() {
		parent::set_up();

		// Admin::assets() reads get_current_screen(), which is only populated in an admin context.
		set_current_screen( 'dashboard' );

		// Force the "no built bundle" path regardless of whether this checkout has run `npm run build`.
		$this->asset_file        = WEB_BUILD_DIR . '/index.asset.php';
		$this->asset_file_backup = $this->asset_file . '.test-backup';
		if ( file_exists( $this->asset_file ) ) {
			rename( $this->asset_file, $this->asset_file_backup );
			$this->moved_asset_file = true;
		}
	}

	public function tear_down() {
		if ( $this->moved_asset_file ) {
			rename( $this->asset_file_backup, $this->asset_file );
		}

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
		$this->assertFileDoesNotExist( $this->asset_file );

		Admin::assets();

		$this->assertTrue( wp_script_is( 'web-script', 'registered' ) );
		$this->assertTrue( wp_style_is( 'web-style', 'registered' ) );
	}
}
