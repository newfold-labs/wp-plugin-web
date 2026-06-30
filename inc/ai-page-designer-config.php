<?php
/**
 * AI Page Designer Debug Utilities
 *
 * @package WPPluginWeb
 */

namespace Web;

/**
 * Class AIPageDesignerDebug
 *
 * Debug logging for the AI Page Designer Worker integration.
 */
class AIPageDesignerDebug {

	/**
	 * Check if debug mode is enabled.
	 *
	 * @return bool
	 */
	public static function is_debug_mode() {
		return \get_option( 'nfd_ai_page_designer_debug_mode', false ) ||
			( defined( 'WP_DEBUG' ) && WP_DEBUG );
	}

	/**
	 * Enable or disable debug mode.
	 *
	 * @param bool $enabled Enable or disable debug mode
	 * @return bool True if debug mode is enabled, false otherwise
	 */
	public static function enable_debug( $enabled = true ) {
		return \update_option( 'nfd_ai_page_designer_debug_mode', $enabled );
	}

	/**
	 * Log a debug message when debug mode is active.
	 *
	 * @param string $message The message to log
	 * @param array  $context The context of the message
	 */
	public static function debug_log( $message, $context = array() ) {
		if ( self::is_debug_mode() ) {
			\error_log(
				\sprintf(
					'[AI Page Designer] %s %s',
					$message,
					! empty( $context ) ? \wp_json_encode( $context ) : ''
				)
			);
		}
	}
}
