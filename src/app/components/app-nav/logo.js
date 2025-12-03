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
		<a
			className="logo-mark"
			style={ { display: 'block', width: '160px', height: 'auto' } }
			onMouseUp={ defocus }
			href="#/home"
		>
			<Brand className="wppw-logo" />
		</a>
	);
};

const Logo = () => {
	return (
		<div className="wppw-logo-wrap" style={ { paddingTop: '12px', paddingBottom: '12px' } }>
			<Mark />
			<Title as="h2" className="screen-reader-text">
				{ __( 'Web WordPress Plugin', 'wp-plugin-web' ) }
			</Title>
		</div>
	);
};

export default Logo;
