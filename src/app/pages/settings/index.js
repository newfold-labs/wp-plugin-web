import './stylesheet.scss';
import graphicUrl from '../../../../assets/svg/large-star.svg';
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
			{isWideViewport && (
				<div><img src={graphicUrl} style={{ float: 'right', width: '80%', height: 'auto' }} alt={__('Star illustration', 'wp-plugin-web')} /></div>
			)}
			<ComingSoon />
			<ContentSettings />
			<CommentSettings />
			<PerformanceCallout />
			
		</div>
	);
};

export default Settings;
