import { Button } from '@wordpress/components';
import Heading from '../heading';
import { ReactComponent as Brand } from '../../../../assets/svg/web-logo.svg';

const Logo = () => {
	return (
		<div className="wppw-logo-wrap">
			<Button
				icon={<Brand className="wppw-logo" />}
				style={{ height: '39px' }}
				iconSize={39}
				href="#/home"
			></Button>
			<Heading level="2" className="screen-reader-text">
				{__('Web.com WordPress Plugin', 'wp-plugin-web')}
			</Heading>
		</div>
	);
};

export default Logo;
