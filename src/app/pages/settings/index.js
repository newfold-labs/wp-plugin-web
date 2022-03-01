import './stylesheet.scss';
import AutomaticUpdates from './automaticUpdates';
import ComingSoon from './comingSoon';
import CommentSettings from './commentSettings';
import ContentSettings from './contentSettings';
import PerformanceCallout from './performanceCallout';
import { useViewportMatch } from '@wordpress/compose';

const Settings = () => {
	const isWideViewport = useViewportMatch('large');
	return (
		<div className="wppw-Settings grid col2 has-page-graphic">
			<AutomaticUpdates />
			<ComingSoon />
			<ContentSettings />
			<CommentSettings />
			<PerformanceCallout />
			
		</div>
	);
};

export default Settings;
