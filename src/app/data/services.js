const services = [
	{
		name: 'pro',
		title: __( 'Pro Services', 'wp-plugin-web' ),
		description: __(
			'Custom websites and marketing done your way',
			'wp-plugin-web'
		),
		cta: __( 'Learn More', 'wp-plugin-web' ),
		url: 'https://www.web.com/websites/pro-website-services?utm_campaign=&utm_content=marketplace_services_pro&utm_term=learn_more&utm_medium=brand_plugin&utm_source=wp-admin/admin.php?page=web#/marketplace/services',
		img: WPPW.assets + 'images/services-pro.jpg',
	},
	{
		name: 'ppc',
		title: __( 'PPC Advertising', 'wp-plugin-web' ),
		description: __(
			'Drive traffic with Pay-Per-Click Advertising',
			'wp-plugin-web'
		),
		cta: __( 'Learn More', 'wp-plugin-web' ),
		url: 'https://www.web.com/online-marketing/pay-per-click-advertising?utm_campaign=&utm_content=marketplace_services_ppc&utm_term=learn_more&utm_medium=brand_plugin&utm_source=wp-admin/admin.php?page=web#/marketplace/services',
		img: WPPW.assets + 'images/services-ppc.jpg',
	},
	{
		name: 'seo',
		title: __( 'SEO Services', 'wp-plugin-web' ),
		description: __(
			'Increase your search ranking',
			'wp-plugin-web'
		),
		cta: __( 'Learn More', 'wp-plugin-web' ),
		url: 'https://www.web.com/online-marketing/small-business-seo-services?utm_campaign=&utm_content=marketplace_services_seo&utm_term=learn_more&utm_medium=brand_plugin&utm_source=wp-admin/admin.php?page=web#/marketplace/services',
		img: WPPW.assets + 'images/services-seo.jpg',
	},
	{
		name: 'webdesign',
		title: __( 'Web Design Services', 'wp-plugin-web' ),
		description: __(
			'Expert web design that gives you peace of mind',
			'wp-plugin-web'
		),
		cta: __( 'Learn More', 'wp-plugin-web' ),
		url: 'https://www.web.com/websites/website-design-services?utm_campaign=&utm_content=marketplace_services_webdesign&utm_term=learn_more&utm_medium=brand_plugin&utm_source=wp-admin/admin.php?page=web#/marketplace/services',
		img: WPPW.assets + 'images/services-webdesign.jpg',
	},
];

export default services;
