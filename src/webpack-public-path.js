/**
 * Set webpack's public path (which defaults to the root directory) to the plugin's
 * versioned build directory so that lazy-loaded chunks resolve correctly.
 * The build URL is set in /inc/Data.php in runtime() and loaded on
 * window.NewfoldRuntime by the nfd-runtime script, which is a dependency
 * of this bundle and therefore always loads first.
 */
if ( 'undefined' !== typeof window && window.NewfoldRuntime?.plugin?.url ) {
	// eslint-disable-next-line no-undef, camelcase
	__webpack_public_path__ = window.NewfoldRuntime.plugin.url.replace(
		/\/?$/,
		'/'
	);
}
