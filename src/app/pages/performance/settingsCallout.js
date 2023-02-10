import { Heading } from '../../components';
import {
	Card,
	CardBody,
	CardHeader,
	CardFooter,
	Button,
} from '@wordpress/components';
import { settings } from '@wordpress/icons';

const SettingsCallout = () => {
	return (
		<Card className="short card-settings-callout">
			<CardHeader>
				<Heading level="3">
					{ __( 'Settings', 'wp-plugin-crazy-domains' ) }
				</Heading>
			</CardHeader>
			<CardBody>
				{ __(
					'Looking for other Settings? You can refine auto-updates, comments and backups of content revisions on the Settings page.',
					'wp-plugin-crazy-domains'
				) }
			</CardBody>
			<CardFooter>
				<Button
					variant="primary"
					href="#/settings"
					icon={ settings }
					className="callout-link-settings"
				>
					{ __( 'Settings', 'wp-plugin-crazy-domains' ) }
				</Button>
			</CardFooter>
		</Card>
	);
};

export default SettingsCallout;
