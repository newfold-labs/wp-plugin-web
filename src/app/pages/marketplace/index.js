import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';
import { useLocation, useMatch, useNavigate } from 'react-router-dom';
import { Container, Page, Title } from '@newfold/ui-component-library';
import { NewfoldRuntime } from "@newfold/wp-module-runtime";
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { default as MarketplaceBody } from '@modules/wp-module-marketplace/components/marketplaceBody';

const MarketplacePage = () => {
	
    // constants to pass to module
	const moduleConstants = {
		'supportsCTB': false,
		'perPage': 12,
		'text': {
			title: __('Marketplace', 'wp-plugin-web'),
			subTitle: __('Explore our marketplace plugins and services.', 'wp-plugin-web'),
			error: __('Oops, there was an error loading the marketplace, please try again later.', 'wp-plugin-web'),
			noProducts: __('Sorry, no marketplace items. Please, try again later.', 'wp-plugin-web'),
			loadMore: __('Load More', 'wp-plugin-web'),
			productPage: {
				error: {
					title: __(
						'Oops! Something Went Wrong',
						'wp-plugin-web'
					),
					description: __(
						'An error occurred while loading the content. Please try again later.',
						'wp-plugin-web'
					),
				},
			},
		}
	};
    // methods to pass to module
    const moduleMethods = {
        apiFetch,
		classNames,
        useState,
        useEffect,
        useLocation,
		useMatch,
		useNavigate,
        NewfoldRuntime,
    };

	return (
        <Page className={"wppw-app-marketplace-page"}>
			<Container className={'wppw-app-marketplace-container'}>
				<Container.Header className={'wppw-app-marketplace-header'}>
					<Title as="h2" className="nfd-flex nfd-items-center nfd-gap-2">
						<ShoppingBagIcon className="nfd-w-8 nfd-h-8" />
						{moduleConstants.text.title}
					</Title>
					<span>{moduleConstants.text.subTitle}</span>
				</Container.Header>

				<Container.Block className={'wppw-app-marketplace-body'}>
					<MarketplaceBody 
						methods={moduleMethods}
						constants={moduleConstants}
					/>
				</Container.Block>

			</Container>
		</Page>
	);
};

export default MarketplacePage;