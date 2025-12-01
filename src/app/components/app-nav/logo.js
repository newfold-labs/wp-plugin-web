import { Button } from '@wordpress/components';
import { Title } from '@newfold/ui-component-library';
import { ReactComponent as Brand } from '../../../../assets/svg/ns-logo.svg';
import { delay } from 'lodash';

const Mark = () => {
	const defocus = () => {
		const button = document.querySelector( '.logo-mark' );
		delay( () => {
			if ( null !== button ) {
				button.blur();
			}
		}, 500 );
	};
	return (
		<Button
			icon={ <Brand className="wppw-logo" /> }
			style={ { width: '160px', height: 'auto' } }
			onMouseUp={ defocus }
			className="logo-mark nfd-p-0"
			href="#/home"
		/>
	);
};

const Logo = () => {
	return (
		<div className="wppw-logo-wrap">
			<Mark />
			<Title as="h2" className="screen-reader-text">
				{ __( 'Web WordPress Plugin', 'wp-plugin-web' ) }
			</Title>
		</div>
	);
};

export default Logo;
