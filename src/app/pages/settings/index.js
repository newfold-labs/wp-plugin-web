import { Container, Page, Title } from "@newfold/ui-component-library";
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { useContext, useEffect } from '@wordpress/element';
import { useLocation } from 'react-router-dom';
import AutomaticUpdates from './automaticUpdates';
import ComingSoon from './comingSoon';
import CommentSettings from './commentSettings';
import ContentSettings from './contentSettings';
import useContainerBlockIsTarget from 'App/util/hooks/useContainerBlockTarget';
import AppStore from 'App/data/store';

const Settings = () => {
	const { store } = useContext( AppStore );
	const isPerformanceEnabled = store.features?.performance ?? true;
	const location = useLocation();

	useEffect(() => {
		// Register the performance portal when component mounts
		const performancePortal = document.getElementById('performance-portal');
		if (performancePortal && window.NFDPortalRegistry) {
			window.NFDPortalRegistry.registerPortal('performance', performancePortal);
		}

		// Clean up when component unmounts
		return () => {
			if (window.NFDPortalRegistry) {
				window.NFDPortalRegistry.unregisterPortal('performance');
			}
		};
	}, []);

	// Auto-open accordion sections based on URL hash
	useEffect(() => {
		const path = location.pathname;

		// Close all accordion sections first
		const allDetails = document.querySelectorAll('.nfd-details');
		allDetails.forEach((details) => {
			details.removeAttribute('open');
		});

		// Map URL paths to accordion selectors
		const accordionMap = {
			'/settings/performance': '.performance-details',
		};

		// Open the appropriate accordion section
		const targetSelector = accordionMap[path];
		if (targetSelector) {
			const targetDetails = document.querySelector(targetSelector);
			if (targetDetails) {
				targetDetails.setAttribute('open', 'true');
			}
		}
	}, [location.pathname]);

	return (
		<Page title="Settings" className={"wppw-app-settings-page"}>
			<div className="wppw-app-settings-page__header nfd-flex nfd-flex-col nfd-gap-y-4">
				<Title as="h1">
					{__('Settings', 'wp-plugin-web')}
				</Title>
				<Title as="h2" className="nfd-font-normal nfd-text-[13px] nfd-color-body">
					{__('Manage common settings for your website.', 'wp-plugin-web')}
				</Title>
			</div>
			
			{isPerformanceEnabled && (
				<Container
					id="nfd-performance"
					className={'nfd-settings-app-wrapper nfd-performance'}
				>
					<details className="nfd-details settings-app-wrapper performance-details" open>
						<summary>
							<div className="nfd-details-content">
								<Title as={'h1'} className={'nfd-mb-2'}>
									{__('Performance', 'wp-plugin-web')}
								</Title>
								<Title 
									as={'h2'}
									className="nfd-font-normal nfd-text-[13px]"
								>
									{__('Optimize your website by managing cache and performance settings', 'wp-plugin-web')}
								</Title>
							</div>
							<span className="nfd-details-icon">
								<ChevronUpIcon />
							</span>
						</summary>
						<div id="performance-portal"></div>
					</details>
				</Container>
			)}

			<Container className={'nfd-settings-app-wrapper wppw-app-settings-container'}>
				<details className="nfd-details settings-app-wrapper settings-details">
					<summary>
						<div
							id={'settings-header'}
							className={'wppw-app-settings-header'}
						>
							<Title as={'h1'} className={'nfd-mb-2'}>
								{__('General Settings', 'wp-plugin-web')}
							</Title>
							<Title
								as={'h2'}
								className="nfd-font-normal nfd-text-[13px]"
							>
								{__('Manage common settings for your website', 'wp-plugin-web')}
							</Title>
						</div>
						<span className="nfd-details-icon">
							<ChevronUpIcon />
						</span>
					</summary>

					<Container.Block separator={true} className={
						classNames(
							'wppw-app-settings-coming-soon',
							useContainerBlockIsTarget('coming-soon-section') && 'wppw-animation-blink'
						)}>
						<ComingSoon />
					</Container.Block>

					<Container.Block separator={true} className={'wppw-app-settings-update'}>
						<AutomaticUpdates />
					</Container.Block>

					<Container.Block separator={true} className={'wppw-app-settings-content'}>
						<ContentSettings />
					</Container.Block>

					<Container.Block className={'wppw-app-settings-comments'}>
						<CommentSettings />
					</Container.Block>
				</details>
			</Container>
		</Page>
	);
};

export default Settings;
