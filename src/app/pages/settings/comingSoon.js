import AppStore from '../../data/store';
import { 
	Heading, 
	ErrorCard, 
	Accordion
} from '../../components';
import {
	webSettingsApiFetch,
	dispatchUpdateSnackbar,
	comingSoonAdminbarToggle
} from '../../util/helpers';
import {
	Card,
	CardBody,
	CardHeader,
	CardDivider,
	ToggleControl
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useUpdateEffect } from 'react-use';

const ComingSoon = () => {
	const { store, setStore } = useContext(AppStore);
	const [comingSoon, setComingSoon] = useState(store.comingSoon);
	const [isError, setError] = useState(false);

	const getComingSoonNoticeText = () => {
		return comingSoon
			? __('Coming soon activated.', 'wp-plugin-web')
			: __('Coming soon deactivated.', 'wp-plugin-web');
	};
	const getComingSoonHelpText = () => {
		return comingSoon
			? __(
					'Coming soon page is active and site is protected.',
					'wp-plugin-web'
			  )
			: __(
					'Coming soon page is not active and site is acessible.',
					'wp-plugin-web'
			  );
	};
	

	useUpdateEffect(() => {
		webSettingsApiFetch({ comingSoon }, setError, (response) => {
			setStore({
				...store,
				comingSoon,
			});
			dispatchUpdateSnackbar(getComingSoonNoticeText());
			comingSoonAdminbarToggle();
		});
	}, [comingSoon]);

	if ( isError ) {
		return <ErrorCard error={isError} />
	}
	return (
		<Card className="card-coming-soon">
			<CardHeader>
				<Heading level="3">
					{__('Coming Soon', 'wp-plugin-web')}
				</Heading>
			</CardHeader>
			<CardBody>
				{__(
					'Not ready for your site to be live? Enable a "Coming Soon" page while you build your website for the public eye. This will disable all parts of your site and show visitors a "coming soon" landing page.',
					'wp-plugin-web'
				)}
			</CardBody>
			<CardDivider />
			<CardBody className="coming-soon-setting">
				<ToggleControl
					label={__('Coming Soon', 'wp-plugin-web')}
					className="coming-soon-toggle"
					checked={comingSoon}
					help={getComingSoonHelpText()}
					onChange={() => {
						setComingSoon((value) => !value);
					}}
				/>
				{ comingSoon && (
					<Accordion
						className="coming-soon-protip"
						summary={__(
							'Pro Tip: Begin collecting subscribers',
							'wp-plugin-web'
						)}
					>
						<p>{__(
							'First, activate the "Jetpack" plugin, connect your site, and enable the "Subscriptions" module. Then, users can subsribe to be notified when you launch and publish new content.',
							'wp-plugin-web'
						)}</p>
					</Accordion>
				)}
			</CardBody>
		</Card>
	);
};

export default ComingSoon;
