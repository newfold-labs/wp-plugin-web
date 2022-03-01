// import { ReactComponent as Phone } from '../../../assets/svg/a-icon__mobilephone_-blue-50.svg';
// import { ReactComponent as Chat } from '../../../assets/svg/a-icon__chat_-orange-50.svg';
// import { ReactComponent as Tweet } from '../../../assets/svg/a-icon__tweet_-yellow-50.svg';
// import { ReactComponent as Book } from '../../../assets/svg/a-icon__book_-orange-50.svg';
// import { ReactComponent as Site } from '../../../assets/svg/a-icon__website_-blue-50.svg';
// import { ReactComponent as Video } from '../../../assets/svg/a-icon__youtube_-orange-50.svg';

const help = [
	{
		name: 'phone',
		title: __('Phone', 'wp-plugin-web'),
		description: __(
			'Give us a ring at 1-866-655-7679',
			'wp-plugin-web'
		),
		icon: 'phone',
		// Svg: Phone,
		cta: __('Call Us', 'wp-plugin-web'),
		url: 'tel:(866)_655-7679',
	},
	{
		name: 'chat',
		title: __('Chat', 'wp-plugin-web'),
		description: __(
			"Have a question? We're here 24/7/365",
			'wp-plugin-web'
		),
		icon: 'format-chat',
		// Svg: Chat,
		cta: __('Live Chat', 'wp-plugin-web'),
		url: 'https://helpchat.web.com/?utm_campaign=&utm_content=help_chat_link&utm_term=live_chat&utm_medium=brand_plugin&utm_source=wp-admin/admin.php?page=web#/help',
	},
	{
		name: 'twitter',
		title: __('Tweet', 'wp-plugin-web'),
		description: __(
			'Tweet us at @webdotcom for support',
			'wp-plugin-web'
		),
		icon: 'twitter',
		// Svg: Tweet,
		cta: __('Tweet Us', 'wp-plugin-web'),
		url: 'https://twitter.com/webdotcom',
	},
	{
		name: 'kb',
		title: __('Knowledge Base', 'wp-plugin-web'),
		description: __(
			'Know what the pros know.',
			'wp-plugin-web'
		),
		icon: 'book',
		// Svg: Book,
		cta: __('Find Answers', 'wp-plugin-web'),
		url: 'https://www.web.com/knowledge?utm_campaign=&utm_content=help_kb_link&utm_term=find_answers&utm_medium=brand_plugin&utm_source=wp-admin/admin.php?page=web#/help',
	},
	{
		name: 'blog',
		title: __('Blog', 'wp-plugin-web'),
		description: __(
			'Get our tips and in-depth articles.',
			'wp-plugin-web'
		),
		icon: 'text-page',
		// Svg: Site,
		cta: __('Learn Stuff', 'wp-plugin-web'),
		url: 'https://www.web.com/blog/?utm_campaign=&utm_content=help_blog_link&utm_term=learn_stuff&utm_medium=brand_plugin&utm_source=wp-admin/admin.php?page=web#/help',
	},
	{
		name: 'video',
		title: __('Video Tutorials', 'wp-plugin-web'),
		description: __(
			'Step-by-step tutorials and additional guides.',
			'wp-plugin-web'
		),
		icon: 'format-video',
		// Svg: Video,
		cta: __('Watch Now', 'wp-plugin-web'),
		url: 'https://www.youtube.com/c/webdotcom',
	},
];

export default help;
