<?php
/**
 * Integration tests for Web\NFD_Plugin_Compat_Check.
 *
 * @package WPPluginWeb
 */

use Web\NFD_Plugin_Compat_Check;

/**
 * Class CompatCheckTest
 */
class CompatCheckTest extends WP_UnitTestCase {

	const FAKE_PLUGIN_SLUG = 'fake-nfd-compat-plugin/fake-nfd-compat-plugin.php';

	private string $fake_plugin_file;

	public function set_up() {
		parent::set_up();

		require_once ABSPATH . 'wp-admin/includes/plugin.php';

		$this->fake_plugin_file = WP_PLUGIN_DIR . '/' . self::FAKE_PLUGIN_SLUG;
		wp_mkdir_p( dirname( $this->fake_plugin_file ) );
		file_put_contents( $this->fake_plugin_file, "<?php\n/**\n * Plugin Name: Fake NFD Compat Plugin\n */\n" );

		update_option( 'active_plugins', [ self::FAKE_PLUGIN_SLUG ] );
		delete_option( 'nfd_plugins_compat_check_conflicts' );
	}

	public function tear_down() {
		delete_option( 'active_plugins' );
		delete_option( 'nfd_plugins_compat_check_conflicts' );

		if ( file_exists( $this->fake_plugin_file ) ) {
			unlink( $this->fake_plugin_file );
		}
		if ( is_dir( dirname( $this->fake_plugin_file ) ) ) {
			rmdir( dirname( $this->fake_plugin_file ) );
		}

		parent::tear_down();
	}

	public function test_legacy_plugin_is_deactivated_and_notice_recorded() {
		$check                 = new NFD_Plugin_Compat_Check( WEB_PLUGIN_FILE );
		$check->legacy_plugins = [ 'Fake NFD Compat Plugin' => self::FAKE_PLUGIN_SLUG ];

		// Legacy conflicts don't disable self; they disable the other (legacy) plugin.
		$this->assertTrue( $check->check_plugin_requirements() );
		$this->assertTrue( $check->has_errors() );
		$this->assertNotContains( self::FAKE_PLUGIN_SLUG, (array) get_option( 'active_plugins', [] ) );

		ob_start();
		$check->admin_notices();
		$notice = ob_get_clean();

		$this->assertStringContainsString( 'notice-error', $notice );
		$this->assertFalse( get_option( 'nfd_plugins_compat_check_conflicts' ) );
	}

	public function test_incompatible_plugin_self_deactivates() {
		$check                      = new NFD_Plugin_Compat_Check( WEB_PLUGIN_FILE );
		$check->incompatible_plugins = [ 'Fake NFD Compat Plugin' => self::FAKE_PLUGIN_SLUG ];

		// Incompatible conflicts disable self and report failure so the caller can bail out early.
		$this->assertFalse( $check->check_plugin_requirements() );
		$this->assertTrue( $check->has_errors() );
	}
}
