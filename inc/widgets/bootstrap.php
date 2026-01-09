<?php
/**
 * Widgets bootstrap file
 *
 * @package WPPluginWeb
 */

namespace Web\Widgets;

use Web\Widgets\SitePreview;

require_once WEB_PLUGIN_DIR . '/inc/widgets/SitePreview.php';

/* Start up the Dashboards */
if ( is_admin() ) {
	new SitePreview();
}
