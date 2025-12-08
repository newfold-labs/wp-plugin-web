import AppStore from '../../data/store';
import { webSettingsApiFetch } from '../../util/helpers';
import { useUpdateEffect } from 'react-use';
import { useState } from '@wordpress/element';
import { Alert, Container, ToggleField } from "@newfold/ui-component-library";
import { useNotification } from 'App/components/notifications';

const AutomaticUpdatesAll = ({ setError, notify, setAutoUpdatesAll, autoUpdatesAll }) => {
	const { store, setStore } = useContext(AppStore);


	const getAllNoticeTitle = () => {
		return autoUpdatesAll
			? __('Enabled All auto-updates', 'wp-plugin-web')
			: __('Disabled All auto-updates', 'wp-plugin-web');
	};
	const getAllNoticeText = () => {
		return autoUpdatesAll
			? __('Everything will automatically update.', 'wp-plugin-web')
			: __('Custom auto-update settings.', 'wp-plugin-web');
	};

	const toggleAutoUpdatesAll = () => {
		if ( autoUpdatesAll ) { // is unchecking
			webSettingsApiFetch(
				{ 
					autoUpdatesMajorCore: false,
					autoUpdatesPlugins: false,
					autoUpdatesThemes: false
				}, 
				setError, 
				(response) => {
					setAutoUpdatesAll(!autoUpdatesAll);
				}
			);
		} else { // is checking
			webSettingsApiFetch(
				{ 
					autoUpdatesMajorCore: true,
					autoUpdatesPlugins: true,
					autoUpdatesThemes: true
				}, 
				setError, 
				(response) => {
					setAutoUpdatesAll(!autoUpdatesAll);
				}
			);
		}
	};

	const notifySuccess = () => {
		notify.push("everything-autoupdate-notice", {
			title: getAllNoticeTitle(),
			description: (
				<span>
					{getAllNoticeText()}
				</span>
			),
			variant: "success",
			autoDismiss: 5000,
		});
	};

	useEffect( () => {
		if ( store.autoUpdatesMajorCore && store.autoUpdatesPlugins && store.autoUpdatesThemes ) {
			setAutoUpdatesAll( true );
		} else {
			setAutoUpdatesAll( false );
		}
	}, [ store.autoUpdatesMajorCore, store.autoUpdatesPlugins, store.autoUpdatesThemes ] );

	useUpdateEffect(() => {
		
		setStore({
			...store,
			autoUpdatesAll,
		});

		notifySuccess();
	}, [autoUpdatesAll]);

	return (
		<ToggleField
			id="autoupdate-all-toggle"
			label={__('Manage All Updates', 'wp-plugin-web')}
			checked={autoUpdatesAll}
			onChange={toggleAutoUpdatesAll}
		/>
	);
}

const AutomaticUpdatesMajorCore = ({ setError, notify, autoUpdatesAll }) => {
	const { store, setStore } = useContext(AppStore);
	const [autoUpdatesMajorCore, setAutoUpdatesCore] = useState(
		store.autoUpdatesMajorCore
	);

	const getCoreNoticeTitle = () => {
		return autoUpdatesMajorCore
			? __('Enabled Core auto-updates', 'wp-plugin-web')
			: __('Disabled Core auto-updates', 'wp-plugin-web');
	};
	const getCoreNoticeText = () => {
		return autoUpdatesMajorCore
			? __('WordPress will automatically update.', 'wp-plugin-web')
			: __('WordPress must be manually updated.', 'wp-plugin-web');
	};

	const toggleAutoUpdatesMajorCore = () => {
		webSettingsApiFetch({ autoUpdatesMajorCore: !autoUpdatesMajorCore }, setError, (response) => {
			setAutoUpdatesCore(!autoUpdatesMajorCore);
		});
	};

	const notifySuccess = () => {
		notify.push("major-core-autoupdate-notice", {
			title: getCoreNoticeTitle(),
			description: (
				<span>
					{getCoreNoticeText()}
				</span>
			),
			variant: "success",
			autoDismiss: 5000,
		});
	};

	useUpdateEffect(() => {
		setStore({
			...store,
			autoUpdatesMajorCore,
		});

		notifySuccess();
	}, [autoUpdatesMajorCore]);
	
useUpdateEffect(() => {
		if ( !autoUpdatesAll ){
			setAutoUpdatesCore(false)
		}
	}, [autoUpdatesAll]);
	return (
		<ToggleField
			id="autoupdate-core-toggle"
			label={__('WordPress Core', 'wp-plugin-web')}
			checked={autoUpdatesMajorCore || store.autoUpdatesAll}
			disabled={store.autoUpdatesAll}
			onChange={toggleAutoUpdatesMajorCore}
		/>
	);
}

const AutomaticUpdatesPlugins = ({ setError, notify, autoUpdatesAll }) => {
	const { store, setStore } = useContext(AppStore);
	const [autoUpdatesPlugins, setAutoUpdatesPlugins] = useState(
		store.autoUpdatesPlugins
	);

	const getPluginsNoticeTitle = () => {
		return autoUpdatesPlugins
			? __('Enabled Plugins auto-update', 'wp-plugin-web')
			: __('Disabled Plugins auto-update', 'wp-plugin-web');
	};
	const getPluginsNoticeText = () => {
		return autoUpdatesPlugins
			? __('All plugins will automatically update.', 'wp-plugin-web')
			: __('Each plugin must be manually updated.', 'wp-plugin-web');
	};

	const toggleAutoUpdatesPlugins = () => {
		webSettingsApiFetch({ autoUpdatesPlugins: !autoUpdatesPlugins }, setError, (response) => {
			setAutoUpdatesPlugins(!autoUpdatesPlugins);
		});
	};

	const notifySuccess = () => {
		notify.push("plugins-autoupdate-notice", {
			title: getPluginsNoticeTitle(),
			description: (
				<span>
					{getPluginsNoticeText()}
				</span>
			),
			variant: "success",
			autoDismiss: 5000,
		});
	};

	useUpdateEffect(() => {
		setStore({
			...store,
			autoUpdatesPlugins,
		});

		notifySuccess();
	}, [autoUpdatesPlugins]);

	useUpdateEffect(() => {
		if ( !autoUpdatesAll ){
			setAutoUpdatesPlugins(false)
		}
	}, [autoUpdatesAll]);
	return (
		<ToggleField
			id="autoupdate-plugins-toggle"
			label={__('Plugins', 'wp-plugin-web')}
			checked={autoUpdatesPlugins || store.autoUpdatesAll}
			disabled={store.autoUpdatesAll}
			onChange={toggleAutoUpdatesPlugins}
		/>
	);
}

const AutomaticUpdatesThemes = ({ setError, notify, autoUpdatesAll }) => {
	const { store, setStore } = useContext(AppStore);
	const [autoUpdatesThemes, setAutoUpdatesThemes] = useState(
		store.autoUpdatesThemes
	);

	const getThemesNoticeTitle = () => {
		return autoUpdatesThemes
			? __('Enabled Themes auto-update', 'wp-plugin-web')
			: __('Disabled Themes auto-update', 'wp-plugin-web');
	};

	const getThemesNoticeText = () => {
		return autoUpdatesThemes
			? __('All themes will automatically update.', 'wp-plugin-web')
			: __('Each theme must be manually updated.', 'wp-plugin-web');
	};

	const toggleAutoUpdatesThemes = () => {
		webSettingsApiFetch({ autoUpdatesThemes: !autoUpdatesThemes }, setError, (response) => {
			setAutoUpdatesThemes(!autoUpdatesThemes);
		});
	};

	const notifySuccess = () => {
		notify.push("themes-autoupdate-notice", {
			title: getThemesNoticeTitle(),
			description: (
				<span>
					{getThemesNoticeText()}
				</span>
			),
			variant: "success",
			autoDismiss: 5000,
		});
	};

	useUpdateEffect(() => {
		setStore({
			...store,
			autoUpdatesThemes,
		});

		notifySuccess();
	}, [autoUpdatesThemes]);

	useUpdateEffect(() => {
		if ( !autoUpdatesAll ){
			setAutoUpdatesThemes(false)
		}
	}, [autoUpdatesAll]);
	return (
		<ToggleField
			id="autoupdate-themes-toggle"
			label={__('Themes', 'wp-plugin-web')}
			checked={autoUpdatesThemes || store.autoUpdatesAll}
			disabled={store.autoUpdatesAll}
			onChange={toggleAutoUpdatesThemes}
		/>
	);
}

const AutomaticUpdates = () => {
		const { store, setStore } = useContext(AppStore);

	const [isError, setError] = useState(false);
		const [autoUpdatesAll, setAutoUpdatesAll] = useState(
		store.autoUpdatesMajorCore &&
		store.autoUpdatesPlugins &&
		store.autoUpdatesThemes
		? true
		: false
	);

	let notify = useNotification();

	return (
		<Container.SettingsField
			title={__('Automatic Updates', 'wp-plugin-web')}
			description={__('Keeping automatic updates on ensures timely security fixes and the latest features.', 'wp-plugin-web')}
		>
			<div className="nfd-flex nfd-flex-col nfd-gap-4">
				<AutomaticUpdatesAll setError={setError} notify={notify} autoUpdatesAll={autoUpdatesAll} setAutoUpdatesAll={setAutoUpdatesAll} />
				<AutomaticUpdatesMajorCore setError={setError} notify={notify} autoUpdatesAll={autoUpdatesAll} />
				<AutomaticUpdatesPlugins setError={setError} notify={notify} autoUpdatesAll={autoUpdatesAll} />
				<AutomaticUpdatesThemes setError={setError} notify={notify} autoUpdatesAll={autoUpdatesAll} />
				{isError &&
					<Alert variant="error">
						{__('Oops! Something went wrong. Please try again.', 'wp-plugin-web')}
					</Alert>
				}
			</div>
		</Container.SettingsField>
	);
}

export default AutomaticUpdates;