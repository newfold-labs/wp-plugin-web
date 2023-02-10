import './stylesheet.scss';
import graphicUrl from '../../../../assets/svg/large-star.svg';
import CacheSettings from './cacheSettings';
import ClearCache from './clearCache';
import SettingsCallout from './settingsCallout';
import { useViewportMatch } from '@wordpress/compose';

const Performance = () => {
	const isWideViewport = useViewportMatch( 'large' );

	return (
		<div className="wppcd-Performance grid col2 has-page-graphic">
			<CacheSettings />
			{ isWideViewport && (
				<div>
					<img
						src={ graphicUrl }
						style={ {
							float: 'right',
							width: '80%',
							height: 'auto',
						} }
						alt={ __( 'Star illustration', 'wp-plugin-crazy-domains' ) }
					/>
				</div>
			) }
			<ClearCache />
			<SettingsCallout />
		</div>
	);
};

export default Performance;
