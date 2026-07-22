<?php

namespace Web\RestApi;

use function NewfoldLabs\WP\ModuleLoader\container;

/**
 * Class CachingController
 */
class CachingController extends \WP_REST_Controller {

	/**
	 * The namespace of this controller's route.
	 *
	 * @var string
	 */
	protected $namespace = 'web/v1';

	/**
	 * Constructor.
	 *
	 * @since 4.7.0
	 */
	public function __construct() {
	}

	/**
	 * Registers the settings route
	 */
	public function register_routes() {

		register_rest_route(
			$this->namespace,
			'/caching',
			[
				'methods'             => \WP_REST_Server::DELETABLE,
				'callback'            => [ $this, 'purge_all' ],
				'permission_callback' => [ $this, 'check_permission' ],
			]
		);
	}

	/**
	 * Clears the entire cache
	 *
	 * @return array
	 */
	public function purge_all(): array {

		container()->get( 'cachePurger' )->purgeAll();

		return [
			'status'  => 'success',
			'message' => 'Cache purged',
		];
	}

	/**
	 * Check permissions for route.
	 *
	 * @return bool|\WP_Error
	 */
	public function check_permission() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new \WP_Error( 'rest_forbidden_context', __( 'Sorry, you are not allowed to access this endpoint.', 'wp-plugin-web' ), [ 'status' => rest_authorization_required_code() ] );
		}

		return true;
	}
}
