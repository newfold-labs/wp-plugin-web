import graphicUrl from '../../../../assets/svg/small-blue-star.svg';
import { Heading, ErrorCard } from '../../components';
import AppStore from '../../data/store';
import {
	webSettingsApiFetch,
	dispatchUpdateSnackbar,
	comingSoonAdminbarToggle,
} from '../../util/helpers';
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	CardFooter,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useUpdateEffect } from 'react-use';

const ComingSoonSection = () => {
	const { store, setStore } = useContext( AppStore );
	const [ isError, setError ] = useState( false );
	const [ comingSoon, setComingSoon ] = useState( store.comingSoon );
	const [ wasComingSoon, setWasComingSoon ] = useState( false );

	const getComingSoonHeadline = () => {
		return comingSoon
			? __( 'Coming Soon', 'wp-plugin-web' )
			: __( 'Site Launched', 'wp-plugin-web' );
	};
	const getComingSoonSubhead = () => {
		return comingSoon
			? __( 'Site visitors see "Coming Soon"', 'wp-plugin-web' )
			: __( 'Your site is live!', 'wp-plugin-web' );
	};
	const getComingSoonBody = () => {
		return comingSoon
			? __(
					"Once you've finished setting up your site, launch it so your visitors can reach it.",
					'wp-plugin-web'
			  )
			: __(
					'Congratulations! Visitors will now see the site. You can always turn Coming Soon on from the Settings tab above.',
					'wp-plugin-web'
			  );
	};
	const getComingSoonGraphicClass = () => {
		return comingSoon ? 'section-graphic' : 'section-graphic reverse';
	};
	const getComingSoonButton = () => {
		return comingSoon ? (
			<Button
				variant="primary"
				icon="yes-alt"
				onClick={ () => {
					setComingSoon( () => false );
					setWasComingSoon( () => true );
				} }
			>
				{ __( 'Launch Site', 'wp-plugin-web' ) }
			</Button>
		) : (
			<>
				<Button
					variant="secondary"
					icon="no-alt"
					onClick={ () => {
						setComingSoon( () => true );
						setWasComingSoon( () => true );
					} }
				>
					{ __( 'Restore Coming Soon', 'wp-plugin-web' ) }
				</Button>
				<Button
					variant="link"
					onClick={ () => {
						setComingSoon( () => false );
						setWasComingSoon( () => false );
					} }
				>
					{ __( 'Dismiss', 'wp-plugin-web' ) }
				</Button>
			</>
		);
	};
	const getComingSoonNoticeText = () => {
		return comingSoon
			? __( 'Coming soon activated.', 'wp-plugin-web' )
			: __( 'Coming soon deactivated.', 'wp-plugin-web' );
	};

	useUpdateEffect( () => {
		webSettingsApiFetch( { comingSoon }, setError, ( response ) => {
			setStore( {
				...store,
				comingSoon,
			} );
			dispatchUpdateSnackbar( getComingSoonNoticeText() );
			comingSoonAdminbarToggle( comingSoon );
		} );
	}, [ comingSoon ] );

	if ( isError ) {
		return (
			<section className="wppw-section coming-soon">
				<ErrorCard error={ isError } className="wppw-section-card" />
			</section>
		);
	}
	// render nothing if coming soon is not active or not just launched
	if ( ! ( comingSoon || ( ! comingSoon && wasComingSoon ) ) ) {
		return <></>;
	}
	return (
		<section className="wppw-section wppw-section-coming-soon">
			<img
				src={ graphicUrl }
				className={ getComingSoonGraphicClass() }
				style={ { top: 0, width: '280px', height: 'auto' } }
				alt={ __( 'Launch site', 'wp-plugin-web' ) }
			/>
			<Card size="large" className="wppw-section-card">
				<CardHeader>
					<Heading level="3">{ getComingSoonHeadline() }</Heading>
					<p>{ getComingSoonSubhead() }</p>
				</CardHeader>
				<CardBody>{ getComingSoonBody() }</CardBody>
				<CardFooter>{ getComingSoonButton() }</CardFooter>
			</Card>
		</section>
	);
};

export default ComingSoonSection;
