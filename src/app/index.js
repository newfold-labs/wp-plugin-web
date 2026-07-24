import 'App/stylesheet.scss';
import 'App/tailwind.pcss';

import { useEffect } from 'react';
import { useLocation, HashRouter as Router } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import kebabCase from 'lodash/kebabCase';
import filter from 'lodash/filter';
import { Root } from "@newfold/ui-component-library";
import { NewfoldRuntime } from '@newfold/wp-module-runtime';
import { SnackbarList, Spinner } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import AppRoutes from 'App/data/routes';
import { AppStoreProvider, AppBootContext } from 'App/data/store';
import ErrorCard from 'App/components/errorCard';
import { setActiveSubnav } from 'App/util/helpers';
import { useHandlePageLoad } from 'App/util/hooks';
import { AppNav } from 'App/components/app-nav';
import { NotificationFeed } from 'App/components/notifications';

// component sourced from module, loaded on demand to keep it out of the main bundle
const NewfoldNotifications = lazy( () =>
	import(
		'../../vendor/newfold-labs/wp-module-notifications/assets/js/components/notifications/'
	)
);
// to pass to notifications module
import apiFetch from '@wordpress/api-fetch';
import { lazy, Suspense, useMemo, useState } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';

const Notices = () => {
	const notices = useSelect(
		( select ) =>
			select( noticesStore )
				.getNotices()
				.filter( ( notice ) => notice.type === 'snackbar' ),
		[]
	);
	const { removeNotice } = useDispatch( noticesStore );
	return (
		<SnackbarList
			className="edit-site-notices"
			notices={ notices }
			onRemove={ removeNotice }
		/>
	);
};

const AppBody = ( props ) => {
	const location = useLocation();
	const hashedPath = '#' + location.pathname;
	const { booted, hasError } = useContext( AppBootContext );

	useHandlePageLoad();

	const mainClassName = useMemo( () => classNames(
		'wpadmin-brand-web',
		`wppw-wp-${ NewfoldRuntime.wpVersion }`,
		`wppw-page-${ kebabCase( location.pathname ) }`,
		props.className,
		'nfd-w-full'
	), [ location.pathname, props.className ] );

	const notificationConstants = useMemo( () => ( {
		context: 'web-plugin',
		page: hashedPath,
	} ), [ hashedPath ] );

	const notificationMethods = useMemo( () => ( {
		apiFetch,
		addQueryArgs,
		filter,
		useState,
		useEffect,
	} ), [] );

	return (
		<main
			id="wppw-app-rendered"
			className={ mainClassName }
		>

			<Suspense fallback={ null }>
				<NewfoldNotifications
					constants={ notificationConstants }
					methods={ notificationMethods }
				/>
			</Suspense>
			<div className="wppw-app-body">
				<div className="wppw-app-body-inner">
					<ErrorBoundary FallbackComponent={ ErrorCard }>
						{ hasError && <ErrorCard error={ hasError } /> }
						{ ( true === booted && <AppRoutes /> ) ||
							( ! hasError && <Spinner /> ) }
					</ErrorBoundary>
				</div>
			</div>

			<div className="wppw-app-snackbar">
				{ 'undefined' !== typeof noticesStore && <Notices /> }
			</div>
		</main>
	);
};

export const App = () => (
	<AppStoreProvider>
		<Root context={{ isRtl: false }}>
			<NotificationFeed>
				<Router>
					<div className="wppw-app-container nfd-flex nfd-flex-col">
						<AppNav />
						<AppBody />
					</div>
				</Router>
			</NotificationFeed>
		</Root>
	</AppStoreProvider>
);

export default App;
