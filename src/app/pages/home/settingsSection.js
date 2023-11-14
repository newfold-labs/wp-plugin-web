import ActionField from "../../components/action-field";
import { SectionSettings } from "../../components/section";

const SettingsSection = () => {
	return (
		<SectionSettings
			title={__('Settings and Performance', 'wp-plugin-web')}
			description={__('Customize & fine-tune your site.', 'wp-plugin-web')}
		>
			<div className="nfd-flex nfd-flex-col nfd-gap-5">
				<ActionField
					label={__("Manage Settings", "wp-plugin-web")}
					buttonLabel={__("Settings", "wp-plugin-web")}
					href={"#/settings"}
					className={"wppw-app-home-settings-action"}
				>
					{__('Manage your site settings. You can ajdust automatic updates, comments, revisions and more.', 'wp-plugin-web')}
				</ActionField>

				<ActionField
					label={__("Performance", "wp-plugin-web")}
					buttonLabel={__("Performance", "wp-plugin-web")}
					href={"#/performance"}
					className={"wppw-app-home-performance-action"}
				>
					{__('Manage site performance and caching settings as well as clear the site cache.', 'wp-plugin-web')}
				</ActionField>

				<ActionField
					label={__("Marketplace", "wp-plugin-web")}
					buttonLabel={__("Visit Marketplace", "wp-plugin-web")}
					href={"#/marketplace"}
					className={"wppw-app-home-marketplace-action"}
				>
					{__('Add site services, themes or plugins from the marketplace.', 'wp-plugin-web')}
				</ActionField>
			</div>
		</SectionSettings >
	);
};

export default SettingsSection;
