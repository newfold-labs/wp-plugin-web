import graphicUrl from '../../../../assets/svg/small-blue-star.svg';
import { Heading, ErrorCard } from '../../components';
import AppStore from '../../data/store';
import {
	crazydomainsSettingsApiFetch,
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
			? __( 'Coming Soon', 'wp-plugin-crazy-domains' )
			: __( 'Site Launched', 'wp-plugin-crazy-domains' );
	};
	const getComingSoonSubhead = () => {
		return comingSoon
			? __( 'Site visitors see "Coming Soon"', 'wp-plugin-crazy-domains' )
			: __( 'Your site is live!', 'wp-plugin-crazy-domains' );
	};
	const getComingSoonBody = () => {
		return comingSoon
			? __(
					"Once you've finished setting up your site, launch it so your visitors can reach it.",
					'wp-plugin-crazy-domains'
			  )
			: __(
					'Congratulations! Visitors will now see the site. You can always turn Coming Soon on from the Settings tab above.',
					'wp-plugin-crazy-domains'
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
				{ __( 'Launch Site', 'wp-plugin-crazy-domains' ) }
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
					{ __( 'Restore Coming Soon', 'wp-plugin-crazy-domains' ) }
				</Button>
				<Button
					variant="link"
					onClick={ () => {
						setComingSoon( () => false );
						setWasComingSoon( () => false );
					} }
				>
					{ __( 'Dismiss', 'wp-plugin-crazy-domains' ) }
				</Button>
			</>
		);
	};
	const getComingSoonNoticeText = () => {
		return comingSoon
			? __( 'Coming soon activated.', 'wp-plugin-crazy-domains' )
			: __( 'Coming soon deactivated.', 'wp-plugin-crazy-domains' );
	};

	useUpdateEffect( () => {
		crazydomainsSettingsApiFetch( { comingSoon }, setError, ( response ) => {
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
			<section className="wppcd-section coming-soon">
				<ErrorCard error={ isError } className="wppcd-section-card" />
			</section>
		);
	}
	// render nothing if coming soon is not active or not just launched
	if ( ! ( comingSoon || ( ! comingSoon && wasComingSoon ) ) ) {
		return <></>;
	}
	return (
		<section className="wppcd-section wppcd-section-coming-soon">
			<img
				src={ graphicUrl }
				className={ getComingSoonGraphicClass() }
				style={ { top: 0, width: '280px', height: 'auto' } }
				alt={ __( 'Launch site', 'wp-plugin-crazy-domains' ) }
			/>
			<Card size="large" className="wppcd-section-card">
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
