import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';
import { useLocation, useMatch, useNavigate } from 'react-router-dom';
import { Container, Page } from '@newfold/ui-component-library';
import { NewfoldRuntime } from "@newfold-labs/wp-module-runtime";
import { default as NewfoldMarketplace } from '@modules/wp-module-marketplace/components/';

const MarketplacePage = () => {
	
    // constants to pass to module
	const moduleConstants = {
		'supportsCTB': false,
		'text': {
			title: __('Marketplace', 'wp-plugin-web'),
			subTitle: __('Explore our featured collection of tools and services.', 'wp-plugin-web'),
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
			<Container className={'wppw-app-marketplace-container nfd-overflow-clip'}>

				<NewfoldMarketplace 
					methods={moduleMethods}
					constants={moduleConstants}
				/>

			</Container>
		</Page>
	);
};

export default MarketplacePage;