// import graphicUrl from '../../../../assets/svg/a-illustration__gator-scales-image-3_-notext.svg';
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	CardFooter,
	Dashicon,
	__experimentalHeading as Heading,
} from '@wordpress/components';

const WebContentSection = () => {
	return (
		<section className="wppw-section wppw-section-home-content">
			{/* <img src={graphicUrl} className='section-graphic' alt={__('Website illustration', 'wp-plugin-web')} /> */}
			<Card size="large" className="wppw-section-card">
				<CardHeader>
					<Heading level="3">
						{__('Website Content', 'wp-plugin-web')}
					</Heading>
				</CardHeader>
				<CardBody>
					<p>
						{__(
							'Manage website content easily with these shortcut links.',
							'wp-plugin-web'
						)}
					</p>
				</CardBody>
				<CardFooter>
					<div className="wppw-cardlist-content">
						<Heading level="4">
							<Dashicon icon="admin-post" />{' '}
							{__('Blog', 'wp-plugin-web')}
						</Heading>
						<p>
							{__(
								'Write a new blog post.',
								'wp-plugin-web'
							)}
						</p>
					</div>
					<Button
						variant="primary"
						href={WPPW.admin + 'post-new.php'}
						icon="admin-post"
					>
						{' '}
						{__('New Post', 'wp-plugin-web')}{' '}
					</Button>
				</CardFooter>
				<CardFooter>
					<div className="wppw-cardlist-content">
						<Heading level="4">
							<Dashicon icon="welcome-add-page" />{' '}
							{__('Pages', 'wp-plugin-web')}
						</Heading>
						<p>
							{__(
								'Add fresh pages to your website.',
								'wp-plugin-web'
							)}
						</p>
					</div>
					<Button
						variant="primary"
						href={WPPW.admin + 'post-new.php?post_type=page'}
						icon="welcome-add-page"
					>
						{__('New Page', 'wp-plugin-web')}
					</Button>
				</CardFooter>
				<CardFooter>
					<div className="wppw-cardlist-content">
						<Heading level="4">
							<Dashicon icon="category" />{' '}
							{__('Categories', 'wp-plugin-web')}
						</Heading>
						<p>
							{__(
								'Organize existing content into categories.',
								'wp-plugin-web'
							)}
						</p>
					</div>
					<Button
						variant="secondary"
						href={WPPW.admin + 'edit-tags.php?taxonomy=category'}
						icon="category"
					>
						{__('Manage Categories', 'wp-plugin-web')}
					</Button>
				</CardFooter>
			</Card>
		</section>
	);
};

export default WebContentSection;
