import graphicUrl from '../../../../assets/svg/small-blue-star.svg';
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	CardFooter,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import AppStore from '../../data/store';
import ErrorCard from '../../components/errorCard';
import { useState } from '@wordpress/element';
import { useUpdateEffect } from 'react-use';
import {
	webSettingsApiFetch,
	dispatchUpdateSnackbar,
	comingSoonAdminbarToggle
} from '../../util/helpers';

const ComingSoonSection = () => {
	const { store, setStore } = useContext(AppStore);
	const [isError, setError] = useState(false);
	const [comingSoon, setComingSoon] = useState(store.comingSoon);
	const [wasComingSoon, setWasComingSoon] = useState(false);

	const getComingSoonHeadline = () => {
		return comingSoon
			? __('Coming Soon', 'wp-plugin-web')
			: __('Site Launched!', 'wp-plugin-web');
	};
	const getComingSoonBody = () => {
		return comingSoon
			? __(
					'Your site currently displays a coming soon page to visitors. Once you have finished setting up your site, be sure to launch it so your visitors can reach it.',
					'wp-plugin-web'
			  )
			: __(
					'Congratulations! You just successfully launched your site! Visitors will now see the site, you can easily undo this and restore the coming soon page if you are not ready.',
					'wp-plugin-web'
			  );
	};
	const getComingSoonGraphicClass = () => {
		return comingSoon
			? 'section-graphic'
			: 'section-graphic reverse';
	};
	const getComingSoonButton = () => {
		return comingSoon ? (
			<Button
				variant="primary"
				icon="yes-alt"
				onClick={() => {
					setComingSoon(() => false);
					setWasComingSoon(() => true);
				}}
			>
				{__('Launch Site', 'wp-plugin-web')}
			</Button>
		) : (
			<>
				<Button
					variant="secondary"
					icon="no-alt"
					onClick={() => {
						setComingSoon(() => true);
						setWasComingSoon(() => true);
					}}
				>
					{__('Restore Coming Soon', 'wp-plugin-web')}
				</Button>
				<Button
					variant="link"
					onClick={() => {
						setComingSoon(() => false);
						setWasComingSoon(() => false);
					}}
				>
					{__('Dismiss', 'wp-plugin-web')}
				</Button>
			</>
		);
	};
	const getComingSoonNoticeText = () => {
		return comingSoon
			? __('Coming soon activated.', 'wp-plugin-web')
			: __('Coming soon deactivated.', 'wp-plugin-web');
	};

	useUpdateEffect(() => {
		webSettingsApiFetch({ comingSoon }, setError,
		 	(response) => {
				setStore({
					...store,
					comingSoon,
				});
				dispatchUpdateSnackbar(getComingSoonNoticeText());
				comingSoonAdminbarToggle(comingSoon);
			}
		);
	}, [comingSoon]);

	if ( isError ) {
		return (
			<section className="wppw-section coming-soon">
				<ErrorCard error={isError} className="wppw-section-card" />
			</section>
		)
	}
	// render nothing if coming soon is not active or not just launched
	if ( !(comingSoon || (!comingSoon && wasComingSoon)) ) {
		return <></>;
	}
	return (
		<section className="wppw-section wppw-section-coming-soon">
			<img src={graphicUrl} className={getComingSoonGraphicClass()} style={{ top: 0 }} alt={__('Web.com`s Snappy holding site', 'wp-plugin-web')}/>
			<Card size="large" className="wppw-section-card">
				<CardHeader>
					<Heading level="3">
						{getComingSoonHeadline()}
					</Heading>
				</CardHeader>
				<CardBody>{getComingSoonBody()}</CardBody>
				<CardFooter>{getComingSoonButton()}</CardFooter>
			</Card>
		</section>
	);
};

export default ComingSoonSection;
