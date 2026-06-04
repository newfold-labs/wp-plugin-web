import { useContext, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useUpdateEffect } from 'react-use';
import { Alert, ToggleField } from '@newfold/ui-component-library';
import AppStore from '../../data/store';
import { featureToggle } from '../../util/helpers';
import { useNotification } from '../../components/notifications';

const AISiteAssistantSettings = () => {
	const { store, setStore } = useContext( AppStore );
	const [ enabled, setEnabled ] = useState(
		store.features?.[ 'ai-site-assistant' ] ?? true
	);
	const [ locked, setLocked ] = useState(
		! store.toggleableFeatures?.[ 'ai-site-assistant' ]
	);
	const [ isError, setError ] = useState( false );
	const notify = useNotification();

	const getNoticeTitle = () => {
		return enabled
			? __( 'AI Site Assistant Enabled', 'wp-plugin-web' )
			: __( 'AI Site Assistant Disabled', 'wp-plugin-web' );
	};

	const getNoticeText = () => {
		return enabled
			? __(
					'Visitors will see the chat assistant on your public site.',
					'wp-plugin-web'
			  )
			: __(
					'The public chat assistant will no longer appear.',
					'wp-plugin-web'
			  );
	};

	const toggleAssistant = () => {
		featureToggle( 'ai-site-assistant', ( response ) => {
			if ( response.success ) {
				setEnabled( ! enabled );
			} else {
				setLocked( true );
				setError( true );
				notify.push( 'feature-toggle-notice', {
					title: __( 'Sorry, that is not allowed.', 'wp-plugin-web' ),
					description: __(
						'This feature cannot currently be modified.',
						'wp-plugin-web'
					),
					variant: 'error',
				} );
			}
		} );
	};

	useUpdateEffect( () => {
		setStore( {
			...store,
			aiSiteAssistant: enabled,
			features: {
				...store.features,
				'ai-site-assistant': enabled,
			},
		} );
		notify.push( 'feature-toggle-notice', {
			title: getNoticeTitle(),
			description: getNoticeText(),
			variant: 'success',
			autoDismiss: 5000,
		} );
	}, [ enabled ] );

	if ( ! store.toggleableFeatures?.[ 'ai-site-assistant' ] ) {
		return null;
	}

	return (
		<div className="nfd-flex nfd-flex-col nfd-gap-6">
			<ToggleField
				id="ai-site-assistant-toggle"
				label={ __( 'AI Site Assistant', 'wp-plugin-web' ) }
				description={ __(
					'Add a public chat assistant that answers visitor questions using your site content.',
					'wp-plugin-web'
				) }
				disabled={ locked }
				checked={ enabled }
				onChange={ toggleAssistant }
			/>

			{ isError && (
				<Alert variant="error">
					{ __(
						'Oops! Something went wrong. Please try again.',
						'wp-plugin-web'
					) }
				</Alert>
			) }
		</div>
	);
};

export default AISiteAssistantSettings;
