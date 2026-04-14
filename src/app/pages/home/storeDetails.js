import { Button, Title } from "@newfold/ui-component-library";
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { PartyIcon } from '../../components/icons';

const hasRequiredStoreInfo = () =>
	Boolean(
		window?.NFDStoreInfo?.data?.address &&
		window?.NFDStoreInfo?.data?.city
	);

const StoreDetails = () => {
    const [ hasStoreInfo, setHasStoreInfo ] = useState( hasRequiredStoreInfo );
    const siteKind = window?.NewfoldRuntime?.siteType || 'website';
    const titleText =
		siteKind === 'store'
			? __( 'Congrats, your store is live!', 'wp-plugin-web' )
			: __( 'Congrats, your website is live!', 'wp-plugin-web' );
    const detailsButtonText = hasStoreInfo
		? __( 'Store Details', 'wp-plugin-web' )
		: __( 'Add Store Details', 'wp-plugin-web' );

	useEffect( () => {
		const handleStoreInfoChange = () => setHasStoreInfo( hasRequiredStoreInfo() );

		document.addEventListener(
			'nfd-submit-store-info-form',
			handleStoreInfoChange
		);

		return () => {
			document.removeEventListener(
				'nfd-submit-store-info-form',
				handleStoreInfoChange
			);
		};
	}, [] );

    return (
		<div className="nfd-home__title-section nfd-flex nfd-justify-between nfd-items-center">
			<span className="nfd-home__title-wrapper nfd-flex nfd-gap-4 nfd-items-center">
				<PartyIcon />
				<Title className="nfd-mb-1 nfd-font-semibold">{ titleText }</Title>
			</span>

			{ siteKind === 'store' && (
				<Button
					as={ 'a' }
					href={ '#' }
					data-store-info-trigger
					variant={ 'secondary' }
				>
					{ detailsButtonText }
				</Button>
			) }
		</div>
	);
};

export default StoreDetails;
