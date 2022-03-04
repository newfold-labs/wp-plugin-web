import './stylesheet.scss';
import Themes from './themes';
import Plugins from './plugins';
import Services from './services';
import { TabPanel, Spinner } from '@wordpress/components';

const Marketplace = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [initialTab, setInitialTab] = useState('plugins');
	const location = useLocation();
	const navigate = useNavigate();

	const onTabNavigate = (tabName) => navigate( '/marketplace/' + tabName, { replace: true });

	useEffect(() => {
		if (location.pathname.includes('/services')) {
			setInitialTab('services');
		} else if (location.pathname.includes('/themes')) {
			setInitialTab('themes');
		} else if (! location.pathname.includes('/plugins')) {
			navigate('/marketplace/plugins', { replace: true });
		}
		setIsLoading(false);
	}, [location]);

	if ( isLoading ) {
		return <Spinner />
	}

	return (
		<div className="wppw-marketplace">
			<TabPanel
				className="wppw-marketplace-tabs"
				activeClass="current-tab"
				orientation="vertical"
				initialTabName={initialTab}
				onSelect={onTabNavigate}
				tabs={[
					{
						name: 'plugins',
						className: 'plugins',
						title: 'Plugins',
						Component: Plugins,
					},
					{
						name: 'services',
						className: 'services',
						title: 'Services',
						Component: Services,
					},
					{
						name: 'themes',
						className: 'themes',
						title: 'Themes',
						Component: Themes,
					},
				]}
			>
				{(tab) => <tab.Component />}
			</TabPanel>
		</div>
	);
};

export default Marketplace;
