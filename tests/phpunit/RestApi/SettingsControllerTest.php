<?php
/**
 * Integration tests for Web\RestApi\SettingsController.
 *
 * @package WPPluginWeb
 */

/**
 * Class SettingsControllerTest
 */
class SettingsControllerTest extends WP_UnitTestCase {

	/**
	 * @var WP_REST_Server
	 */
	protected $server;

	public function set_up() {
		parent::set_up();

		global $wp_rest_server;
		$wp_rest_server = new WP_REST_Server();
		$this->server   = $wp_rest_server;
		do_action( 'rest_api_init', $this->server );

		wp_set_current_user( 0 );
	}

	public function tear_down() {
		global $wp_rest_server;
		$wp_rest_server = null;

		parent::tear_down();
	}

	public function test_get_settings_requires_authentication() {
		$request  = new WP_REST_Request( 'GET', '/web/v1/settings' );
		$response = $this->server->dispatch( $request );

		$this->assertSame( 401, $response->get_status() );
	}

	public function test_get_settings_returns_current_settings_for_admin() {
		$admin_id = self::factory()->user->create( [ 'role' => 'administrator' ] );
		wp_set_current_user( $admin_id );

		$request  = new WP_REST_Request( 'GET', '/web/v1/settings' );
		$response = $this->server->dispatch( $request );

		$this->assertSame( 200, $response->get_status() );
		$this->assertArrayHasKey( 'autoUpdatesMajorCore', $response->get_data() );
	}
}
