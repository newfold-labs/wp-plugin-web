import { Container, Page } from "@newfold/ui-component-library";
import AutomaticUpdates from './automaticUpdates';
import ComingSoon from './comingSoon';
import CommentSettings from './commentSettings';
import ContentSettings from './contentSettings';
import useContainerBlockIsTarget from 'App/util/hooks/useContainerBlockTarget';

const Settings = () => {
	return (
		<Page title="Settings" className={"wppw-app-settings-page"}>
			<Container className={'wppw-app-settings-container'}>
				<Container.Header
					title={__('Settings', 'wp-plugin-web')}
					description={__('This is where you can manage common settings for your website.', 'wp-plugin-web')}
					className={'wppw-app-settings-header'}
				/>

				<Container.Block separator={true} className={
					classNames(
						'wppw-app-settings-coming-soon',
						useContainerBlockIsTarget( 'coming-soon-section' ) && 'wppbh-animation-blink'
					)}>
					<ComingSoon />
				</Container.Block>

				<Container.Block separator={true} className={'wppw-app-settings-update'}>
					<AutomaticUpdates />
				</Container.Block>

				<Container.Block separator={true} className={'wppw-app-settings-content'}>
					<ContentSettings />
				</Container.Block>

				<Container.Block className={'wppw-app-settings-comments'}>
					<CommentSettings />
				</Container.Block>

			</Container>
		</Page>
	);
};

export default Settings;
