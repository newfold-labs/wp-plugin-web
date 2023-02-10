/**
 * Set webpack's public path that defaults to the root directory to be the plugin's build directory
 * so that lazy-loading works correctly. This value is set in /includes/Data.php in runtime().
 */
export default () => {
	if ( 'undefined' !== typeof window.WPPCD && 'url' in window.WPPCD ) {
		__webpack_public_path__ = window.WPPCD.url;
	}
};
