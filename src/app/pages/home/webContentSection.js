import graphicUrl from '../../images/section-web-content.png';
import { Heading } from '../../components';
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	CardFooter,
	Dashicon,
} from '@wordpress/components';

const WebContentSection = () => {
	return (
		<section className="wppw-section wppw-section-home-content">
			<img
				src={ graphicUrl }
				className="section-graphic"
				alt={ __( 'Website illustration', 'wp-plugin-web' ) }
			/>
			<Card size="large" className="wppw-section-card">
				<CardHeader>
					<Heading level="3">
						{ __( 'Website Content', 'wp-plugin-web' ) }
					</Heading>
					<p>
						{ __(
							'Create, manage & sort your story.',
							'wp-plugin-web'
						) }
					</p>
				</CardHeader>
				<CardFooter>
					<div className="wppw-cardlist-content">
						<Heading level="4">
							<Dashicon icon="admin-post" />{ ' ' }
							{ __( 'Blog', 'wp-plugin-web' ) }
						</Heading>
						<p>
							{ __(
								'Update your site with news as your story unfolds.',
								'wp-plugin-web'
							) }
						</p>
					</div>
					<Button
						variant="primary"
						href={ WPPW.admin + 'post-new.php' }
						icon="admin-post"
					>
						{ ' ' }
						{ __( 'New Post', 'wp-plugin-web' ) }{ ' ' }
					</Button>
				</CardFooter>
				<CardFooter>
					<div className="wppw-cardlist-content">
						<Heading level="4">
							<Dashicon icon="welcome-add-page" />{ ' ' }
							{ __( 'Pages', 'wp-plugin-web' ) }
						</Heading>
						<p>
							{ __(
								"Share who you are, what you're about and how to get in touch.",
								'wp-plugin-web'
							) }
						</p>
					</div>
					<Button
						variant="primary"
						href={ WPPW.admin + 'post-new.php?post_type=page' }
						icon="welcome-add-page"
					>
						{ __( 'New Page', 'wp-plugin-web' ) }
					</Button>
				</CardFooter>
				<CardFooter>
					<div className="wppw-cardlist-content">
						<Heading level="4">
							<Dashicon icon="category" />{ ' ' }
							{ __( 'Categories', 'wp-plugin-web' ) }
						</Heading>
						<p>
							{ __(
								'Sort your story so visitors can focus on their interests.',
								'wp-plugin-web'
							) }
						</p>
					</div>
					<Button
						variant="secondary"
						href={ WPPW.admin + 'edit-tags.php?taxonomy=category' }
						icon="category"
					>
						{ __( 'Manage Categories', 'wp-plugin-web' ) }
					</Button>
				</CardFooter>
			</Card>
		</section>
	);
};

export default WebContentSection;
