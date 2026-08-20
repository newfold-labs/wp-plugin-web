<?php
/**
 * Functionality related to Settings
 * see RestApi/SettingsController.php for implementation
 *
 * @package WPPluginWeb
 */

namespace Web;

/**
 * Filter wp revisions according to plugin setting
 *
 * @param int            $num  Number of posts to retain (unused; required by filter signature).
 * @param WP_Post|object $post Post object (unused; required by filter signature).
 * @return int
 */
function nfd_settings_revisions( int $num, $post ): int { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed -- Callback arity for wp_revisions_to_keep.
	return (int) get_option( 'nfd_wp_post_revisions', 5 );
}
add_filter( 'wp_revisions_to_keep', __NAMESPACE__ . '\\nfd_settings_revisions', 10, 2 );

if ( ! defined( 'EMPTY_TRASH_DAYS' ) ) {
	$nfd_empty_trash_days = get_option( 'nfd_empty_trash_days', 30 );
	define( 'EMPTY_TRASH_DAYS', $nfd_empty_trash_days );
}
