import { dispatch } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { NewfoldRuntime } from "@newfold-labs/wp-module-runtime";

let lastNoticeId;

/**
 * Wrapper method to dispatch snackbar notice
 *
 * @param  string text text for notice
 * @param  text
 */
export const dispatchUpdateSnackbar = ( text = 'Settings Saved' ) => {
	//clear previous notice so they don't stack up when quickly saving multiple settings
	dispatch( 'core/notices' ).removeNotice( lastNoticeId );

	//make new
	dispatch( 'core/notices' )
		.createNotice( 'info', text, {
			type: 'snackbar',
			isDismissible: true,
		} )
		.then( ( result ) => {
			// save as notice to dismiss later
			lastNoticeId = result.notice.id;
		} );
};

/**
 * Wrapper method for toggling a feature via the features API
 *
 * @param {string}   featureName  the name of the feature
 * @param {Function} thenCallback method to call in promise then
 * @return {Promise} Features API promise with attached then callback
 */
export const featureToggle = async ( featureName, thenCallback ) => {
	if ( true === window.NewfoldFeatures.features[ featureName ] ) {
		return window.NewfoldFeatures.disable( featureName ).then(
			( response ) => {
				thenCallback( response );
			}
		);
	}
	// else
	return window.NewfoldFeatures.enable( featureName ).then( ( response ) => {
		thenCallback( response );
	} );
};

/**
 * Helper to update UI elements as features are enabled/disabled
 *
 * @param {string}  selector    css selector to find the element
 * @param {boolean} enabled     whether the element is now activated/deactivated
 * @param {string}  className   the css class to add/remove - default 'nfd-disabled'
 * @param {boolean} forceReload whether this update requires a forced page reload - default false
 */
export const updateUI = (
	selector,
	enabled = true,
	className = 'nfd-disabled',
	forceReload = false
) => {
	const element = document.querySelector( selector );
	if ( element ) {
		if ( ! enabled ) {
			element.classList.add( className );
		} else {
			element.classList.remove( className );
		}
	}
	if ( forceReload ) {
		window.location.reload();
	}
};

/**
 * Wrapper method to post setting to web endpoint
 *
 * @param {Object}   data         object of data
 * @param {Function} passError    setter for the error in component
 * @param {Function} thenCallback method to call in promise then
 * @return {Promise} apiFetch promise with attached then and catch callbacks
 */
export const webSettingsApiFetch = ( data, passError, thenCallback ) => {
	return apiFetch( {
		// path: 'web/v1/settings', //  can't use path bacause it breaks on temp domains
		url: NewfoldRuntime.createApiUrl( '/web/v1/settings' ),
		method: 'POST',
		data,
	} )
		.then( ( response ) => {
			thenCallback( response );
		} )
		.catch( ( error ) => {
			passError( error );
		} );
};

/**
 * Wrapper method to post request to web cache endpoint
 *
 * @param {*} data object of data
 * @param passError setter for the error in component
 * @param thenCallback method to call in promise then
 * @return apiFetch promise
 */
export const webPurgeCacheApiFetch = ( data, passError, thenCallback ) => {
	return apiFetch( {
		url: NewfoldRuntime.createApiUrl( '/web/v1/caching' ),
		method: 'DELETE',
		data,
	} )
		.then( ( response ) => {
			thenCallback( response );
		} )
		.catch( ( error ) => {
			passError( error );
		} );
};

/**
 * Coming soon admin bar
 */
export const comingSoonAdminbarToggle = ( comingSoon ) => {
	window.NewfoldRuntime.comingSoon.toggleAdminBarSiteStatus( comingSoon );
};

/**
 * Decorates an external link URL with UTM params.
 *
 * The utm_term, if passed, should be the link anchor text.
 * The utm_content should be the unique identifier for the link.
 * The utm_campaign is optional and reserved for special occasions.
 *
 * @param {string} url The original URL.
 * @param {Object} params The URL parameters to add.
 *
 * @return {string} The new URL.
 */
export const addUtmParams = (url, params = {}) => {
	params.utm_source = `wp-admin/admin.php?page=web${window.location.hash}`;
	params.utm_medium = 'web_plugin';
	return addQueryArgs(url, params);
}