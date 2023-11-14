import ActionField from "../../components/action-field";
import { SectionSettings } from "../../components/section";

const WebContentSection = () => {
	return (
		<SectionSettings
			title={__('Website Content', 'wp-plugin-web')}
			description={__('Create, manage & sort your story.', 'wp-plugin-web')}
		>
			<div className="nfd-flex nfd-flex-col nfd-gap-5">
				<ActionField
					label={__("Blog", "wp-plugin-web")}
					buttonLabel={__("New Post", "wp-plugin-web")}
					href={window.NewfoldRuntime.admin_url + 'post-new.php'}
					className={"wppw-app-home-blog-action"}
				>
					{__('Write a new blog post.', 'wp-plugin-web')}
				</ActionField>

				<ActionField
					label={__("Pages", "wp-plugin-web")}
					buttonLabel={__("New Page", "wp-plugin-web")}
					href={window.NewfoldRuntime.admin_url + 'post-new.php?post_type=page'}
					className={"wppw-app-home-pages-action"}
				>
					{__('Add fresh pages to your website.', 'wp-plugin-web')}
				</ActionField>

				<ActionField
					label={__("Categories", "wp-plugin-web")}
					buttonLabel={__("Manage Categories", "wp-plugin-web")}
					href={window.NewfoldRuntime.admin_url + 'edit-tags.php?taxonomy=category'}
					className={"wppw-app-home-categories-action"}
				>
					{__('Organize existing content into categories.', 'wp-plugin-web')}
				</ActionField>
			</div>
		</SectionSettings >
	);
};

export default WebContentSection;
