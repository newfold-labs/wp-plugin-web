import AppStore from '../../data/store';
import { Page, Container } from "@newfold/ui-component-library";
import { useState, useEffect, useContext, Fragment } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useUpdateEffect } from 'react-use';
import { NewfoldRuntime } from "@newfold-labs/wp-module-runtime";
import { useNotification } from 'App/components/notifications';
import { 
    webSettingsApiFetch as newfoldSettingsApiFetch, 
    webPurgeCacheApiFetch as newfoldPurgeCacheApiFetch
} from '../../util/helpers';

import { default as NewfoldPerformance } from '@modules/wp-module-performance/components/performance/';

const PerformancePage = () => {

    // constants to pass to module
    const moduleConstants = {};

    // methods to pass to module
    const moduleMethods = {
        apiFetch,
        classnames: classNames,
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

	const moduleComponents = {
        Fragment,
	}

	return (
		<Page title="Performance" className={"wppw-app-settings-page"}>
			<Container className={'wppw-app-settings-container'}>
                <Container.Header
                    title={__('Performance', 'wp-plugin-web')}
                    description={__('This is where you can manage cache settings for your website.', 'wp-plugin-web')}
                    className={'wppw-app-settings-header'}
                />
                <NewfoldPerformance
                    constants={moduleConstants}
                    methods={moduleMethods}
                    Components={moduleComponents}
                />
            </Container>
		</Page>
	);
};

export default PerformancePage;
