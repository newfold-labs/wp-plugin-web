<?php
/**
 * Class that runs checks before loading possibly incompatible code.
 * Checks if incompatible plugins are already active and if so, self deactivate (this plugin).
 * Checks for legacy plugins and deactivates them in favor of self (this plugin).
 * Ensures that only a single notice is displayed per plugin.
 *
 * @package WPPluginWeb
 */

namespace Web;

/**
 * Class NDF_Plugin_Compat_Check
 *
 * This class is responsible for performing basic checks to see if there are other plugins that would conflict with this one.
 */
class NFD_Plugin_Compat_Check {

	/**
	 * A reference to the main plugin file (relative to plugins dir) or plugin slug
	 *
	 * @var string
	 */
	public string $slug;

	/**
	 * Plugin name
	 *
	 * @var string
	 */
	public string $name = '';

	/**
	 * Global list of plugins with associated error (to prevent duplicate notices)
	 *
	 * conflict {
	 *  plugin: slug,
	 *  error: WP_Error
	 * }
	 *
	 * @var array
	 */
	public array $conflicts;


	/**
	 * Newfold incompatibe plugins
	 * Don't allow this plugin to be installed while these are active.
	 * Deactivate this on activation if incompatible plugin is found.
	 *
	 * @var array
	 */
	public array $incompatible_plugins = [];

	/**
	 * Newfold legacy plugins
	 * If active when this plugin activates, deactivate legacy plugin to avoid conflict.
	 * Deactivate legacy on activation of this.
	 *
	 * @var array
	 */
	public array $legacy_plugins = [];

	/**
	 * Setup our class properties
	 *
	 * @param string $file Plugin file
	 */
	public function __construct( string $file ) {
		require_once ABSPATH . '/wp-admin/includes/plugin.php';
		// require_once ABSPATH . '/wp-includes/option.php';
		$this->slug      = $this->get_plugin_slug( $file );
		$this->name      = $this->get_plugin_name( $file );
		$conflicts       = get_option( 'nfd_plugins_compat_check_conflicts', [] );
		$this->conflicts = is_array( $conflicts ) ? $conflicts : [];
	}

	/**
	 * Get the plugin name from the plugin file headers
	 *
	 * @param string $file Plugin file
	 * @return string
	 */
	public function get_plugin_name( string $file ): string {
		$plugin = get_file_data( $file, [ 'name' => 'Plugin Name' ] );
		return $plugin['name'] ?? '';
	}

	/**
	 * Get the plugin slug from the plugin path
	 *
	 * @param string $file Plugin file
	 * @return string
	 */
	public function get_plugin_slug( string $file ): string {
		$wp = ABSPATH . 'wp-content/plugins/';
		if ( strpos( $file, $wp ) === 0 ) {
			$file = substr( $file, strlen( $wp ) );
		}
		return $file;
	}

	/**
	 * Check all our plugin requirements.
	 * Displays an admin notice and deactivates the plugin if all requirements are not met.
	 *
	 * @return bool
	 */
	public function check_plugin_requirements(): bool {

		if ( ! empty( $this->incompatible_plugins ) ) {
			$this->check_incompatible_plugins();

			// Incompatible plugin error
			if ( $this->has_errors() ) {
				// Suppress 'Plugin Activated' notice
				unset( $_GET['activate'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				$this->deactivate();
				add_action( 'admin_notices', [ $this, 'admin_notices' ] );

				// Fail check, disable self
				return false;
			}
		}

		if ( ! empty( $this->legacy_plugins ) ) {
			$this->check_legacy_plugins();

			// Legacy plugin error
			if ( $this->has_errors() ) {
				// Suppress 'Plugin Activated' notice
				unset( $_GET['activate'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				$this->deactivate();
				add_action( 'admin_notices', [ $this, 'admin_notices' ] );

				// Pass check, but disable other plugin
				return true;
			}
		}

		// Pre-existing conflict found
		// and the errors are loaded from option without displaying the notice yet
		if ( $this->has_errors() ) {
			add_action( 'admin_notices', [ $this, 'admin_notices' ] );
		}

		// Pass check, enable self
		return true;
	}

	/**
	 * Check if a incompatible plugin is active.
	 */
	public function check_incompatible_plugins(): void {
		foreach ( $this->incompatible_plugins as $incompatible_name => $incompatible_file ) {
			$conflict_plugins = array_column( $this->conflicts, 'slug' );
			if ( function_exists( 'is_plugin_active' ) && is_plugin_active( $incompatible_file ) && ! in_array( $this->slug, $conflict_plugins, true ) ) {
				$error = new \WP_Error();
				$error->add(
					'nfd_plugin_incompatible',
					sprintf(
						/* translators: 1: plugin name 2: incompatible plugin name */
						__( '"%1$s" has self-deactivated. It is incompatible with "%2$s".', 'wp-plugin-web' ),
						$this->name,
						$incompatible_name
					)
				);
				$this->conflicts[] = [
					'slug'   => $this->slug,
					'source' => $this->slug,
					'error'  => $error,
				];
				update_option( 'nfd_plugins_compat_check_conflicts', $this->conflicts );
			}
		}
	}

	/**
	 * Check if a legacy plugin is active.
	 */
	public function check_legacy_plugins(): void {
		foreach ( $this->legacy_plugins as $legacy_name => $legacy_file ) {
			$conflict_plugins = array_column( $this->conflicts, 'slug' );
			if ( function_exists( 'is_plugin_active' ) && is_plugin_active( $legacy_file ) && ! in_array( $legacy_file, $conflict_plugins, true ) ) {
				$error = new \WP_Error();
				$error->add(
					'nfd_plugin_legacy',
					sprintf(
						/* translators: 1: legacy plugin name 2: plugin name */
						__( '"%1$s" has been deactivated. It is incompatible with "%2$s".', 'wp-plugin-web' ),
						$legacy_name,
						$this->name
					)
				);
				$this->conflicts[] = [
					'slug'   => $legacy_file,
					'source' => $this->slug,
					'error'  => $error,
				];
				update_option( 'nfd_plugins_compat_check_conflicts', $this->conflicts );
			}
		}
	}

	/**
	 * Check if any errors were encountered during our plugin checks
	 *
	 * @return bool
	 */
	public function has_errors(): bool {
		foreach ( $this->conflicts as $conflict ) {
			if ( $conflict['source'] === $this->slug ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Deactivate the plugin
	 */
	public function deactivate(): void {
		$conflict_plugins = array_column( $this->conflicts, 'slug' );
		if ( function_exists( 'deactivate_plugins' ) ) {
			deactivate_plugins( $conflict_plugins );
		}
	}

	/**
	 * Display error messages in the admin
	 */
	public function admin_notices(): void {
		$conflict_errors = array_column( $this->conflicts, 'error' );
		foreach ( $conflict_errors as $error ) {
			if ( \is_wp_error( $error ) ) {
				echo '<div class="notice notice-error is-dismissible">';
				echo '<p>' . esc_html( $error->get_error_message() ) . '</p>';
				echo '</div>';
			}
		}
		delete_option( 'nfd_plugins_compat_check_conflicts' );
	}
}
