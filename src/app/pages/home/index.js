
import { Page, Container } from "@newfold/ui-component-library";
import ComingSoon from 'App/pages/settings/comingSoon';
import SettingsSection from 'App/pages/home/settingsSection';
import WebContentSection from 'App/pages/home/webContentSection';
import WebHostingSection from 'App/pages/home/webHostingSection';

const Home = () => {
	return (
	<Page title="Settings" className={"wppw-app-home-page wppw-home"}>
		<Container className={'wppw-app-home-container'}>
			<Container.Header
				title={__('Home', 'wp-plugin-web')}
				className={'wppw-app-home-header'}
				/>

			<Container.Block separator={true} className={'wppw-app-home-coming-soon'}>
				<ComingSoon />
			</Container.Block>

			<Container.Block separator={true} className={'wppw-app-home-content'}>
				<WebContentSection />
			</Container.Block>

			<Container.Block separator={true} className={'wppw-app-home-settings'}>
				<SettingsSection />
			</Container.Block>

			<Container.Block separator={false} className={'wppw-app-home-hosting'}>
				<WebHostingSection />
			</Container.Block>
		</Container>
	</Page>
	);
};

export default Home;
