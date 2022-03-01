import './stylesheet.scss';
import CacheSettings from './cacheSettings';
import ClearCache from './clearCache';
import SettingsCallout from './settingsCallout';
import { useViewportMatch } from '@wordpress/compose';

const Performance = () => {
	const isWideViewport = useViewportMatch('large');

	return (
		<div className="wppw-Performance grid col2 has-page-graphic">
			<CacheSettings />
			<ClearCache />
			<SettingsCallout />
		</div>
	);
};

export default Performance;
