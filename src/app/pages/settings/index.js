import './stylesheet.scss';
import graphicUrl from '../../../../assets/svg/large-star.svg';
import AutomaticUpdates from './automaticUpdates';
import ComingSoon from './comingSoon';
import CommentSettings from './commentSettings';
import ContentSettings from './contentSettings';
import PerformanceCallout from './performanceCallout';
import { useViewportMatch } from '@wordpress/compose';

const Settings = () => {
	const isWideViewport = useViewportMatch( 'large' );
	return (
		<div className="wppcd-Settings grid col2 has-page-graphic">
			<AutomaticUpdates />
			{ isWideViewport && (
				<div>
					<img
						src={ graphicUrl }
						style={ {
							float: 'right',
							width: '80%',
							height: 'auto',
							transform: 'rotate3d(0, 0, 1, 90deg)',
						} }
						alt={ __( 'Star illustration', 'wp-plugin-crazy-domains' ) }
					/>
				</div>
			) }
			<ComingSoon />
			<ContentSettings />
			<CommentSettings />
			<PerformanceCallout />
		</div>
	);
};

export default Settings;
