<?php
/**
 * PHPUnit test config sample.
 *
 * Copy this file to `wp-tests-config.php` (gitignored) in the same directory and fill
 * in values for your machine. Use a dedicated test database — the WP core test suite
 * truncates/recreates its tables on every run, so never point this at a real site DB.
 *
 * @package WPPluginWeb
 */

// Path to a WordPress core checkout (with a trailing slash), used only for ABSPATH —
// e.g. this repo's Local/wp-env WordPress install, or a dedicated core checkout.
define( 'ABSPATH', '/path/to/wordpress/' );

define( 'DB_NAME', 'wordpress_test' );
define( 'DB_USER', 'root' );
define( 'DB_PASSWORD', 'root' );
define( 'DB_HOST', '127.0.0.1' );
define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );

$table_prefix = 'wptests_';

define( 'WP_TESTS_DOMAIN', 'localhost' );
define( 'WP_TESTS_EMAIL', 'admin@example.org' );
define( 'WP_TESTS_TITLE', 'Web WordPress Plugin Test Suite' );

define( 'WP_PHP_BINARY', 'php' );

define( 'WPLANG', '' );
