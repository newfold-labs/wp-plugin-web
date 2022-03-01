import './stylesheet.scss';
import ComingSoonSection from './comingSoonSection';
import WebContentSection from './webContentSection';
import WebHostingSection from './webHostingSection';
import SettingsSection from './settingsSection';

const Home = () => {
	return (
		<div className="wppw-home">
			<ComingSoonSection />
			<WebContentSection />
			<SettingsSection />
			<WebHostingSection />
		</div>
	);
};

export default Home;
