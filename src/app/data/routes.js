import { 
	HomeIcon,
	ShoppingBagIcon,
	WrenchScrewdriverIcon,
	BoltIcon, 
	AdjustmentsHorizontalIcon,
	BuildingStorefrontIcon,
	QuestionMarkCircleIcon } 
from '@heroicons/react/24/outline';
import { NewfoldRuntime } from "@newfold-labs/wp-module-runtime";
import { getMarketplaceSubnavRoutes } from '@modules/wp-module-marketplace/components/marketplaceSubnav';
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/home';
import Marketplace from '../pages/marketplace';
import Settings from '../pages/settings';
import Performance from '../pages/performance';
import Help from '../pages/help';
import Admin from '../pages/admin';

const addPartialMatch = ( prefix, path ) =>
	prefix === path ? `${ prefix }/*` : path;

export const AppRoutes = () => {
	return (
		<Routes>
			{ routes.map(
				( page ) => (
					true === page.condition && ( 
						<Route
							end
							key={ page.name }
							path={ addPartialMatch( '/marketplace', page.name ) }
							element={ <page.Component /> }
						/>
					)
			) ) }
			<Route path="/" element={ <Home /> } />
			<Route
				path="*"
				element={
					<main style={ { padding: '1rem' } }>
						<p>
							{ __( "There's nothing here!", 'wp-plugin-web' ) }
						</p>
					</main>
				}
			/>
		</Routes>
	);
};

const topRoutePaths = [
	'/home',
	'/marketplace',
	'/performance',
	'/settings',
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
		subRoutes: await getMarketplaceSubnavRoutes(),
		condition: true,
	},
	{
		name: '/performance',
		title: __( 'Performance', 'wp-plugin-web' ),
		Component: Performance,
		Icon: BoltIcon,
		condition: await window.NewfoldFeatures.isEnabled( 'performance' ),
	},
	{
		name: '/settings',
		title: __( 'Settings', 'wp-plugin-web' ),
		Component: Settings,
		Icon: AdjustmentsHorizontalIcon,
		condition: true,
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

export const topRoutes = _filter( routes, ( route ) =>
	topRoutePaths.includes( route.name )
);

export const utilityRoutes = _filter( routes, ( route ) =>
	utilityRoutePaths.includes( route.name )
);

export default AppRoutes;
