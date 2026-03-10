import { Button, Title } from "@newfold/ui-component-library";
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { PartyIcon } from '../../components/icons';

const StoreDetails = () => {
    const [ hasStoreInfo, setHasStoreInfo ] = useState(
		!! (
			window?.NFDStoreInfo?.data?.address &&
			window?.NFDStoreInfo?.data?.city
		)
	);

    const siteKind = window.NewfoldRuntime.siteType || 'website';

	useEffect( () => {
		// Update hasStoreInfo when storeInfo changes
		const handleStoreInfoChange = () => {
			setHasStoreInfo(
				!! (
					window?.NFDStoreInfo?.data?.address &&
					window?.NFDStoreInfo?.data?.city
				)
			);
		};
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

    return <div className="nfd-home__title-section nfd-flex nfd-justify-between nfd-items-center">
				<span
					className={
						'nfd-home__title-wrapper nfd-flex nfd-gap-4 nfd-items-center'
					}
				>
					<PartyIcon />
					<Title className="nfd-mb-1 nfd-font-semibold">
						{ siteKind === 'store'
							? __(
									'Congrats, your store is live!',
									'wp-plugin-web'
							  )
							: __(
									'Congrats, your website is live!',
									'wp-plugin-web'
							  ) }
					</Title>
				</span>
				{ siteKind === 'store' && (
					// Store details button only on store sites
					<Button
						as={ 'a' }
						href={ '#' }
						data-store-info-trigger
						variant={ 'secondary' }
					>
						{ hasStoreInfo
							? __( 'Store Details', 'wp-plugin-web' )
							: __( 'Add Store Details', 'wp-plugin-web' ) }
					</Button>
				) }
			</div>
}

export default StoreDetails;
