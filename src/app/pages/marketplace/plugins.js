import { Heading, MarketplaceItem } from '../../components';
import plugins from '../../data/plugins';

const Plugins = () => {
	return (
		<div className="wppw-plugins grid col2">
			<Heading level="3" className="screen-reader-text">
				{ __( 'Plugins', 'wp-plugin-web' ) }
			</Heading>
			{ plugins.map( ( item ) => (
				<MarketplaceItem key={ item.url } item={ item } />
			) ) }
		</div>
	);
};

export default Plugins;
