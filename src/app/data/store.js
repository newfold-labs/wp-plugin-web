import { createContext, useMemo } from '@wordpress/element';
import { NewfoldRuntime } from '@newfold/wp-module-runtime';
import apiFetch from '@wordpress/api-fetch';
import camelCase from 'lodash/camelCase';

const DEFAULT = {
	store: {},
	setStore: () => {},
};

const AppStore = createContext( DEFAULT );

/**
 * Boot/error status lives in its own context so components that only care
 * about app readiness (e.g. AppBody) don't re-render every time a settings
 * component writes to the store.
 */
export const AppBootContext = createContext( {
	booted: false,
	hasError: false,
} );

export const webApiFetchSettings = async ( options = {} ) => {
	return await apiFetch( {
		url: NewfoldRuntime.createApiUrl('/web/v1/settings'),
		...options,
	} );
};

export const reformStore = ( store, endpoint, response ) => {
	return {
		...store,
		[ camelCase( endpoint ) ]: response,
	};
};

export const AppStoreProvider = ( { children } ) => {
	const [ booted, setBooted ] = useState( false );
	const [ hasError, setError ] = useState( false );
	const [ store, setStore ] = useState( {} );

	const contextStore = useMemo(
		() => ( { store, setStore, booted, setBooted, hasError, setError } ),
		[ store, booted, hasError ]
	);

	const bootStatus = useMemo(
		() => ( { booted, hasError } ),
		[ booted, hasError ]
	);

	useEffect( () => {
		if ( false === booted ) {
			webApiFetchSettings()
				.then( ( settings ) => {
					setStore( ( previousStore ) => ( {
						...previousStore,
						...window.WPPW,
						...settings,
						features: window.NewfoldFeatures.features,
						toggleableFeatures: window.NewfoldFeatures.togglable,
					} ) );
					setBooted( true );
				} )
				.catch( ( error ) => {
					setError( error );
				} );
		}
	}, [] );

	return (
		<AppStore.Provider value={ contextStore }>
			<AppBootContext.Provider value={ bootStatus }>
				{ children }
			</AppBootContext.Provider>
		</AppStore.Provider>
	);
};

export default AppStore;
