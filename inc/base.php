<?php
/**
 * Base functions
 *
 * @package WPPluginWeb
 */

namespace Web;

/**
 * Check if plugin install date exists.
 *
 * @return bool
 */
function web_has_plugin_install_date(): bool {
	return ! empty( get_option( 'web_plugin_install_date', '' ) );
}

/**
 * Get the plugin install date.
 *
 * @return string
 */
function web_get_plugin_install_date(): string {
	return (string) get_option( 'web_plugin_install_date', gmdate( 'U' ) );
}

/**
 * Set the plugin install date.
 *
 * @param string $value Date in Unix timestamp format.
 */
function web_set_plugin_install_date( string $value ): void {
	update_option( 'web_plugin_install_date', $value, true );
}


/**
 * Get the number of days since the plugin was installed.
 *
 * @return int
 */
function web_get_days_since_plugin_install_date(): int {
	return absint( ( (int) gmdate( 'U' ) - (int) web_get_plugin_install_date() ) / DAY_IN_SECONDS );
}

/**
 * Basic setup
 */
function web_setup(): void {
	if ( ( '' === get_option( 'mm_master_aff' ) || false === get_option( 'mm_master_aff' ) ) && defined( 'MMAFF' ) ) {
		update_option( 'mm_master_aff', MMAFF );
	}
	$install_date = get_option( 'mm_install_date' );
	if ( empty( $install_date ) ) {
		update_option( 'mm_install_date', date( 'M d, Y' ) ); // phpcs:ignore WordPress.DateTime.RestrictedFunctions.date_date
		$event                            = [
			't'    => 'event',
			'ec'   => 'plugin_status',
			'ea'   => 'installed',
			'el'   => 'Install date: ' . get_option( 'mm_install_date', date( 'M d, Y' ) ),  // phpcs:ignore WordPress.DateTime.RestrictedFunctions.date_date
			'keep' => false,
		];
		$events                           = get_option( 'mm_cron', [] );
		$events['hourly'][ $event['ea'] ] = $event;
		update_option( 'mm_cron', $events );
	}
	if ( ! web_has_plugin_install_date() ) {
		$date = false;
		if ( ! empty( $install_date ) ) {
			$date = \DateTime::createFromFormat( 'M d, Y', $install_date );
		}
		web_set_plugin_install_date( $date ? $date->format( 'U' ) : gmdate( 'U' ) );
	}
}

add_action( 'admin_init', __NAMESPACE__ . '\\web_setup' );


/**
 * Filter the date used in data module
 *
 * @param string $install_date value from hook (unused; required by filter signature)
 * @return string Unix timestamp.
 */
function web_install_date_filter( $install_date ): string { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found -- Callback arity for nfd_install_date_filter.
	return web_get_plugin_install_date();
}
add_filter( 'nfd_install_date_filter', __NAMESPACE__ . '\\web_install_date_filter' );

/**
 * SVG allowed tags for kses
 *
 * Exampl use: wp_kses( $svg, KSES_ALLOWED_SVG_TAGS );
 */
const KSES_ALLOWED_SVG_TAGS = [
	'svg'  => [
		'class'        => true,
		'fill'         => true,
		'height'       => true,
		'stroke'       => true,
		'stroke-width' => true,
		'viewbox'      => true,
		'width'        => true,
		'xmlns'        => true,
	],
	'g'    => [
		'fill'              => true,
		'stroke'            => true,
		'stroke-miterlimit' => true,
		'stroke-width'      => true,
	],
	'rect' => [
		'fill'      => true,
		'height'    => true,
		'rx'        => true,
		'transform' => true,
		'width'     => true,
		'x'         => true,
		'y'         => true,
	],
	'text' => [
		'fill'        => true,
		'font-family' => true,
		'font-size'   => true,
		'font-weight' => true,
		'title'       => true,
		'transform'   => true,
	],
	'path' => [
		'd'               => true,
		'fill'            => true,
		'opacity'         => true,
		'stroke-linecap'  => true,
		'stroke-linejoin' => true,
		'stroke-width'    => true,
		'transform'       => true,

	],
];
