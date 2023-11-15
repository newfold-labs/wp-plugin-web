import ActionField from "../../components/action-field";
import { SectionSettings } from "../../components/section";

const WebHostingSection = () => {
	return (
		<SectionSettings
			title={__('Web Hosting', 'wp-plugin-web')}
			description={__('Access & manage your Web.com account.', 'wp-plugin-web')}
		>
			<div className="nfd-flex nfd-flex-col nfd-gap-5">
				<ActionField
					label={__("Manage Web Account", "wp-plugin-web")}
					buttonLabel={__("Manage Web Account", "wp-plugin-web")}
					href={
						`https://www.web.com/my-account/home?` +
						`&utm_campaign=` +
						`&utm_content=home_hosting_sites_link` +
						`&utm_term=manage_sites` +
						`&utm_medium=brand_plugin` +
						`&utm_source=wp-admin/admin.php?page=web#/home`
					}
					target="_blank"
					className={"wppw-app-home-sites-action"}
				>
					{__("Manage Web account products, options and billing.", "wp-plugin-web")}
				</ActionField>
			</div>
		</SectionSettings>
	);
};

export default WebHostingSection;
