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
		<section className="wppcd-section wppcd-section-home-content">
			<img
				src={ graphicUrl }
				className="section-graphic"
				alt={ __( 'Website illustration', 'wp-plugin-crazy-domains' ) }
			/>
			<Card size="large" className="wppcd-section-card">
				<CardHeader>
					<Heading level="3">
						{ __( 'Website Content', 'wp-plugin-crazy-domains' ) }
					</Heading>
					<p>
						{ __(
							'Create, manage & sort your story.',
							'wp-plugin-crazy-domains'
						) }
					</p>
				</CardHeader>
				<CardFooter>
					<div className="wppcd-cardlist-content">
						<Heading level="4">
							<Dashicon icon="admin-post" />{ ' ' }
							{ __( 'Blog', 'wp-plugin-crazy-domains' ) }
						</Heading>
						<p>
							{ __(
								'Update your site with news as your story unfolds.',
								'wp-plugin-crazy-domains'
							) }
						</p>
					</div>
					<Button
						variant="primary"
						href={ WPPCD.admin + 'post-new.php' }
						icon="admin-post"
					>
						{ ' ' }
						{ __( 'New Post', 'wp-plugin-crazy-domains' ) }{ ' ' }
					</Button>
				</CardFooter>
				<CardFooter>
					<div className="wppcd-cardlist-content">
						<Heading level="4">
							<Dashicon icon="welcome-add-page" />{ ' ' }
							{ __( 'Pages', 'wp-plugin-crazy-domains' ) }
						</Heading>
						<p>
							{ __(
								"Share who you are, what you're about and how to get in touch.",
								'wp-plugin-crazy-domains'
							) }
						</p>
					</div>
					<Button
						variant="primary"
						href={ WPPCD.admin + 'post-new.php?post_type=page' }
						icon="welcome-add-page"
					>
						{ __( 'New Page', 'wp-plugin-crazy-domains' ) }
					</Button>
				</CardFooter>
				<CardFooter>
					<div className="wppcd-cardlist-content">
						<Heading level="4">
							<Dashicon icon="category" />{ ' ' }
							{ __( 'Categories', 'wp-plugin-crazy-domains' ) }
						</Heading>
						<p>
							{ __(
								'Sort your story so visitors can focus on their interests.',
								'wp-plugin-crazy-domains'
							) }
						</p>
					</div>
					<Button
						variant="secondary"
						href={ WPPCD.admin + 'edit-tags.php?taxonomy=category' }
						icon="category"
					>
						{ __( 'Manage Categories', 'wp-plugin-crazy-domains' ) }
					</Button>
				</CardFooter>
			</Card>
		</section>
	);
};

export default WebContentSection;
