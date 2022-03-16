const services = [
	{
		name: 'codeguard',
		title: __( 'CodeGuard', 'wp-plugin-web' ),
		description: __(
			'Protect your website with a daily, automatic backup!',
			'wp-plugin-web'
		),
		cta: __( 'Learn More', 'wp-plugin-web' ),
		url: 'https://www.web.com/codeguard',
		img: WPPW.assets + 'images/services-codeguard.png',
	},
	{
		name: 'ppc',
		title: __( 'PPC Management', 'wp-plugin-web' ),
		description: __(
			'PPC advertising can increase performance and drive more revenue!',
			'wp-plugin-web'
		),
		cta: __( 'Get More Leads', 'wp-plugin-web' ),
		url: 'https://www.web.com/services/ppc',
		img: WPPW.assets + 'images/services-ppc.png',
	},
	{
		name: 'webdesign',
		title: __( 'Web Design Services', 'wp-plugin-web' ),
		description: __(
			'Impress potential clients with a professionally-designed website!',
			'wp-plugin-web'
		),
		cta: __( 'Learn More', 'wp-plugin-web' ),
		url: 'https://www.web.com/services/web-design',
		img: WPPW.assets + 'images/services-webdesign.png',
	},
];

export default services;
