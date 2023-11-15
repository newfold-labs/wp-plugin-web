import AutomaticUpdates from './automaticUpdates';
import ComingSoon from './comingSoon';
import CommentSettings from './commentSettings';
import ContentSettings from './contentSettings';
import { Page } from '../../components/page';
import { SectionContainer, SectionHeader, SectionContent } from '../../components/section';

const Settings = () => {
	return (
		<Page title="Settings" className={"wppw-app-settings-page"}>
			<SectionContainer className={'wppw-app-settings-container'}>
				<SectionHeader
					title={__('Settings', 'wp-plugin-web')}
					subTitle={__('This is where you can manage common settings for your website.', 'wp-plugin-web')}
					className={'wppw-app-settings-header'}
				/>

				<SectionContent separator={true} className={'wppw-app-settings-coming-soon'}>
					<ComingSoon />
				</SectionContent>

				<SectionContent separator={true} className={'wppw-app-settings-update'}>
					<AutomaticUpdates />
				</SectionContent>

				<SectionContent separator={true} className={'wppw-app-settings-content'}>
					<ContentSettings />
				</SectionContent>

				<SectionContent className={'wppw-app-settings-comments'}>
					<CommentSettings />
				</SectionContent>

			</SectionContainer>
		</Page>
	);
};

export default Settings;
