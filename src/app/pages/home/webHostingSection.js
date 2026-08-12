import ActionField from "../../components/action-field";
import { Container } from "@newfold/ui-component-library";

const WebHostingSection = () => {
	return (
		<Container.SettingsField
			title={__('Web Hosting', 'wp-plugin-web')}
			description={__('Access & manage your Network Solutions account.', 'wp-plugin-web')}
		>
			<div className="nfd-flex nfd-flex-col nfd-gap-5">
				<ActionField
					label={__("Manage Network Solutions Account", "wp-plugin-web")}
					buttonLabel={__("Manage Network Solutions Account", "wp-plugin-web")}
					href={
						`https://www.networksolutions.com/my-account/home?` +
						`&utm_campaign=` +
						`&utm_content=home_hosting_sites_link` +
						`&utm_term=manage_sites` +
						`&utm_medium=brand_plugin` +
						`&utm_source=wp-admin/admin.php?page=web#/home`
					}
					target="_blank"
					className={"wppw-app-home-sites-action"}
				>
					{__("Manage Network Solutions account products, options and billing.", "wp-plugin-web")}
				</ActionField>
			</div>
		</Container.SettingsField>
	);
};

export default WebHostingSection;
