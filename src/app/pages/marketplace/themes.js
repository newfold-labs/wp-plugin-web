import MarketplaceItem from '../../components/marketplaceItem';
import themes from '../../data/themes';
import Heading from '../../components/heading';

const Themes = () => {
	return (
		<div className="wppw-themes grid col2">
			<Heading level="3" className="screen-reader-text">
				{__('Themes', 'wp-plugin-web')}
			</Heading>
			{themes.map((item) => (
				<MarketplaceItem key={item.url} item={item} />
			))}
		</div>
	);
};

export default Themes;
