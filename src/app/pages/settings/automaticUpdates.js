import {
	Card,
	CardBody,
	CardHeader,
	CardDivider,
	ToggleControl,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useEffect } from 'react';
import { useUpdateEffect } from 'react-use';
import AppStore from '../../data/store';
import ErrorCard from '../../components/errorCard';
import {
	webSettingsApiFetch,
	dispatchUpdateSnackbar,
} from '../../util/helpers';

const AutomaticUpdates = () => {
	const { store, setStore } = useContext(AppStore);
	const [autoUpdatesAll, setAutoUpdatesAll] = useState(
		store.autoUpdatesMajorCore && store.autoUpdatesPlugins && store.autoUpdatesThemes ? true : false
	);
	const [autoUpdatesMajorCore, setAutoUpdatesCore] = useState(
		store.autoUpdatesMajorCore
	);
	const [autoUpdatesPlugins, setAutoUpdatesPlugins] = useState(
		store.autoUpdatesPlugins
	);
	const [autoUpdatesThemes, setAutoUpdatesThemes] = useState(
		store.autoUpdatesThemes
	);
	const [isError, setError] = useState(false);

	const getAllNoticeText = () => {
		return autoUpdatesAll
			? __('Everything will auto-update.', 'wp-plugin-web')
			: __('Custom auto-update settings.', 'wp-plugin-web');
	};
	const getAllHelpText = () => {
		return autoUpdatesAll
			? __(
					'Yay! Everything will automatically update.',
					'wp-plugin-web'
			  )
			: __(
					'Custom automatic update settings.',
					'wp-plugin-web'
			  );
	};
	const getCoreNoticeText = () => {
		return autoUpdatesMajorCore
			? __('Core will auto-update.', 'wp-plugin-web')
			: __('Core will not auto-update.', 'wp-plugin-web');
	};
	const getCoreHelpText = () => {
		return autoUpdatesMajorCore
			? __(
					'WordPress will automatically update.',
					'wp-plugin-web'
			  )
			: __(
					'WordPress must be manually updated.',
					'wp-plugin-web'
			  );
	};
	const getPluginsNoticeText = () => {
		return autoUpdatesPlugins
			? __('Plugins will auto-update.', 'wp-plugin-web')
			: __(
					'Plugins will not auto-update.',
					'wp-plugin-web'
			  );
	};
	const getPluginsHelpText = () => {
		return autoUpdatesPlugins
			? __(
					'All plugins will automatically update.',
					'wp-plugin-web'
			  )
			: __(
					'Each plugin must be manually updated.',
					'wp-plugin-web'
			  );
	};
	const getThemesNoticeText = () => {
		return autoUpdatesThemes
			? __('Themes will auto-update.', 'wp-plugin-web')
			: __(
					'Theme will not auto-update.',
					'wp-plugin-web'
			  );
	};
	const getThemesHelpText = () => {
		return autoUpdatesThemes
			? __(
					'All themes will automatically update.',
					'wp-plugin-web'
			  )
			: __(
					'Each theme must be manually updated.',
					'wp-plugin-web'
			  );
	};

	useEffect(() => {
		if ( autoUpdatesMajorCore && autoUpdatesPlugins && autoUpdatesThemes ) {
			setAutoUpdatesAll( true );
		} else {
			setAutoUpdatesAll( false );
		}
	}, [autoUpdatesMajorCore, autoUpdatesPlugins, autoUpdatesThemes]);

	useUpdateEffect(() => {
		if ( autoUpdatesAll ) {
			setAutoUpdatesCore( autoUpdatesAll );
			setAutoUpdatesPlugins( autoUpdatesAll );
			setAutoUpdatesThemes( autoUpdatesAll );
			dispatchUpdateSnackbar( getAllNoticeText() );
		} else {
			// don't set anything, just enable them
		}
	}, [autoUpdatesAll]);

	useUpdateEffect(() => {
		webSettingsApiFetch({ autoUpdatesMajorCore }, setError, (response) => {
			setStore({
				...store,
				autoUpdatesMajorCore,
			});
			if ( !autoUpdatesAll ) {
				dispatchUpdateSnackbar( getCoreNoticeText() );
			}
		});
	}, [autoUpdatesMajorCore]);

	useUpdateEffect(() => {
		webSettingsApiFetch({ autoUpdatesPlugins }, setError, (response) => {
			setStore({
				...store,
				autoUpdatesPlugins,
			});
			if ( !autoUpdatesAll ) {
				dispatchUpdateSnackbar( getPluginsNoticeText() );
			}
		});
	}, [autoUpdatesPlugins]);

	useUpdateEffect(() => {
		webSettingsApiFetch({ autoUpdatesThemes }, setError, (response) => {
			setStore({
				...store,
				autoUpdatesThemes,
			});
			if ( !autoUpdatesAll ) {
				dispatchUpdateSnackbar( getThemesNoticeText() );
			}
		});
	}, [autoUpdatesThemes]);

	if ( isError ) {
		return <ErrorCard error={isError} />
	}
	return (
		<Card className="card-auto-updates">
			<CardHeader>
				<Heading level="3">
					{__('Automatic Updates', 'wp-plugin-web')}
				</Heading>
			</CardHeader>
			<CardBody>
				{__(
					'Allow your site to stay updated automatically.',
					'wp-plugin-web'
				)}
			</CardBody>
			<CardDivider />
			<CardBody 
				className="autoupdate-all-setting"
			>
				<ToggleControl
					label={__('Everything', 'wp-plugin-web')}
					className="autoupdate-all-toggle"
					checked={autoUpdatesAll}
					help={getAllHelpText()}
					onChange={() => {
						setAutoUpdatesAll((value) => !value);
					}}
				/>
			</CardBody>
			<CardDivider />
			<CardBody 
				className={`autoupdate-core-setting  ${autoUpdatesAll  ? 'disabled' : ''}` }
			>
				<ToggleControl
					label={__('Core', 'wp-plugin-web')}
					className="autoupdate-core-toggle"
					checked={autoUpdatesMajorCore}
					disabled={autoUpdatesAll}
					help={getCoreHelpText()}
					onChange={() => {
						setAutoUpdatesCore((value) => !value);
					}}
				/>
			</CardBody>
			<CardDivider />
			<CardBody 
				className={`autoupdate-plugin-setting  ${autoUpdatesAll  ? 'disabled' : ''}` }
				>
				<ToggleControl
					label={__('Plugins', 'wp-plugin-web')}
					className="autoupdate-plugin-toggle"
					checked={autoUpdatesPlugins}
					disabled={autoUpdatesAll}
					help={getPluginsHelpText()}
					onChange={() => {
						setAutoUpdatesPlugins((value) => !value);
					}}
				/>
			</CardBody>
			<CardDivider />
			<CardBody 
				className={`autoupdate-theme-setting  ${autoUpdatesAll  ? 'disabled' : ''}` }
				>
				<ToggleControl
					label={__('Themes', 'wp-plugin-web')}
					className="autoupdate-theme-toggle"
					checked={autoUpdatesThemes}
					disabled={autoUpdatesAll}
					help={getThemesHelpText()}
					onChange={() => {
						setAutoUpdatesThemes((value) => !value);
					}}
				/>
			</CardBody>
		</Card>
	);
};

export default AutomaticUpdates;
