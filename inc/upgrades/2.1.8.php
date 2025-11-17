<?php
/**
 * Handle updates for version 2.1.8
 *
 * AUTO_INCREMENT fix for the options table.
 *
 * @package WPPluginWeb
 */

use Web\AutoIncrement;

require_once __DIR__ . '/../AutoIncrement.php';

global $wpdb;

( new AutoIncrement( $wpdb ) )
	->fix_auto_increment( 'options', 'option_id' );
