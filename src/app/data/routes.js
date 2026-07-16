import {
	HomeIcon,
	ShoppingBagIcon,
	BoltIcon,
	AdjustmentsHorizontalIcon,
	QuestionMarkCircleIcon,
	SparklesIcon,
} from '@heroicons/react/24/outline';
import { getMarketplaceSubnavRoutes } from '@modules/wp-module-marketplace/components/marketplaceSubnav';
import { lazy, Suspense } from '@wordpress/element';
import { Spinner } from '@wordpress/components';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/home';

// Route-based code splitting: each page loads its own chunk on first visit.
const Marketplace = lazy( () => import( '../pages/marketplace' ) );
const Settings = lazy( () => import( '../pages/settings' ) );
const Help = lazy( () => import( '../pages/help' ) );
const Admin = lazy( () => import( '../pages/admin' ) );
const AIDesigner = lazy( () => import( '../pages/ai-designer' ) );

const topRoutePaths = [
	'/home',
	'/marketplace',
	'/ai-designer',
	'/settings',
	'/help',
];
const utilityRoutePaths = [ '/help' ];

export const routes = [
	{
		name: '/home',
		title: __( 'Home', 'wp-plugin-web' ),
		Component: Home,
		Icon: HomeIcon,
		condition: true,
	},
	{
		name: '/marketplace',
		title: __( 'Marketplace', 'wp-plugin-web' ),
		Component: Marketplace,
		Icon: ShoppingBagIcon,
		// Subnav routes are fetched at runtime via useMarketplaceSubnavRoutes().
		hasSubRoutes: true,
		condition: true,
	},
	{
		name: '/settings/performance',
		title: __( 'Performance', 'wp-plugin-web' ),
		Component: Settings,
		Icon: BoltIcon,
		condition: window.NewfoldFeatures?.features?.performance ?? false,
	},
	{
		name: '/settings',
		title: __( 'Settings', 'wp-plugin-web' ),
		Component: Settings,
		Icon: AdjustmentsHorizontalIcon,
		condition: true,
	},
	{
		name: '/ai-designer',
		title: __( 'AI Designer', 'wp-plugin-web' ),
		Component: AIDesigner,
		Icon: SparklesIcon,
		condition:
			( window.NewfoldRuntime?.capabilities?.canAccessAI &&
				window.NewfoldRuntime?.capabilities
					?.canAccessAIPageDesigner ) ||
			false,
	},
	{
		name: '/help',
		title: __( 'Help', 'wp-plugin-web' ),
		Component: Help,
		Icon: QuestionMarkCircleIcon,
		condition: true,
	},
	{
		name: '/admin',
		title: __( 'Admin', 'wp-plugin-web' ),
		Component: Admin,
		condition: true,
	},
];

/**
 * Fetch marketplace subnav routes without blocking initial render.
 *
 * @return {Array} subnav routes (empty until the API responds)
 */
export const useMarketplaceSubnavRoutes = () => {
	const [ subnavRoutes, setSubnavRoutes ] = useState( [] );

	useEffect( () => {
		let isMounted = true;
		getMarketplaceSubnavRoutes()
			.then( ( fetchedRoutes ) => {
				if ( isMounted ) {
					setSubnavRoutes( fetchedRoutes );
				}
			} )
			.catch( () => {} );
		return () => {
			isMounted = false;
		};
	}, [] );

	return subnavRoutes;
};

export const AppRoutes = () => {
	return (
		<Suspense fallback={ <Spinner /> }>
			<Routes>
				{ routes.map( ( route ) => {
					if ( ! route.condition ) {
						return null;
					}

					const { name, Component } = route;
					const routePath = route.hasSubRoutes ? `${ name }/*` : name;

					return (
						<Route
							key={ name }
							path={ routePath }
							element={ <Component /> }
						/>
					);
				} ) }

				<Route path="/" element={ <Home /> } />
				<Route
					path="*"
					element={
						<main style={ { padding: '1rem' } }>
							<p>
								{ __(
									"There's nothing here!",
									'wp-plugin-web'
								) }
							</p>
						</main>
					}
				/>
			</Routes>
		</Suspense>
	);
};

export const topRoutes = _filter( routes, ( route ) =>
	topRoutePaths.includes( route.name )
);

export const utilityRoutes = _filter( routes, ( route ) =>
	utilityRoutePaths.includes( route.name )
);

export default AppRoutes;
