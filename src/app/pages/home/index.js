
import { Page } from '../../components/page';
import { SectionContainer, SectionHeader, SectionContent } from '../../components/section';
import ComingSoon from '../settings/comingSoon';
import SettingsSection from './settingsSection';
import WebContentSection from './webContentSection';
import WebHostingSection from './webHostingSection';

import { useEffect } from 'react';

const Home = () => {
	return (
	<Page title="Settings" className={"wppw-app-home-page wppw-home"}>
		<SectionContainer className={'wppw-app-home-container'}>
			<SectionHeader
				title={__('Home', 'wp-plugin-web')}
				className={'wppw-app-home-header'}
				/>

			<SectionContent separator={true} className={'wppw-app-home-coming-soon'}>
				<ComingSoon />
			</SectionContent>

			<SectionContent separator={true} className={'wppw-app-home-content'}>
				<WebContentSection />
			</SectionContent>

			<SectionContent separator={true} className={'wppw-app-home-settings'}>
				<SettingsSection />
			</SectionContent>

			<SectionContent separator={false} className={'wppw-app-home-hosting'}>
				<WebHostingSection />
			</SectionContent>
		</SectionContainer>
	</Page>
	);
};

export default Home;
