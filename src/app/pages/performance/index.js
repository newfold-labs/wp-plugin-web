import AppStore from '../../data/store';
import { Page, Container } from "@newfold/ui-component-library";
import { useState, useEffect, useContext, Fragment } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useUpdateEffect } from 'react-use';
import { NewfoldRuntime } from "@newfold/wp-module-runtime";
import { useNotification } from 'App/components/notifications';
import { 
    webSettingsApiFetch as newfoldSettingsApiFetch, 
    webPurgeCacheApiFetch as newfoldPurgeCacheApiFetch
} from '../../util/helpers';

// import { default as NewfoldPerformance } from '@modules/wp-module-performance/components/performance/';

const PerformancePage = () => {

    // constants to pass to module
    const moduleConstants = {};

    // methods to pass to module
    const moduleMethods = {
        apiFetch,
        useState,
        useEffect,
        useContext,
        NewfoldRuntime,
        useNotification,
        newfoldSettingsApiFetch,
        newfoldPurgeCacheApiFetch,
        useUpdateEffect,
        AppStore,
    };

    	useEffect( () => {
		// run when mounts

		const performancePortal =
			document.getElementById( 'performance-portal' );

		if ( performancePortal ) {
			window.NFDPortalRegistry.registerPortal(
				'performance',
				performancePortal
			);
		}

		// run when unmounts
		return () => {
			window.NFDPortalRegistry.unregisterPortal( 'performance' );
		};
	}, [] );

	const moduleComponents = {
        Fragment,
	}

	return (
		<Page title="Performance" className={"wppw-app-settings-page"}>
			<Container className={'wppw-app-settings-container'} id="nfd-performance">

                <div id="nfd-performance-portal-wrapper">
							<div id="performance-portal"></div>
						</div>
            </Container>
		</Page>
	);
};

export default PerformancePage;
