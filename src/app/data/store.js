import { createContext, useMemo } from '@wordpress/element';
import { NewfoldRuntime } from '@newfold/wp-module-runtime';
import apiFetch from '@wordpress/api-fetch';

const DEFAULT = {
	store: {},
	setStore: () => {},
};

const AppStore = createContext( DEFAULT );

export const webApiFetchSettings = async ( options = {} ) => {
	return await apiFetch( {
		url: NewfoldRuntime.createApiUrl('/web/v1/settings'),
		...options,
	} );
};

export const reformStore = ( store, endpoint, response ) => {
	return {
		...store,
		[ _camelCase( endpoint ) ]: response,
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

	useEffect( () => {
		if ( false === booted ) {
			webApiFetchSettings()
				.then( ( settings ) => {
					setStore( { 
						...store,
						...window.WPPW,
						...settings,
						features: window.NewfoldFeatures.features,
						toggleableFeatures: window.NewfoldFeatures.togglable,
					} );
					setBooted( true );
				} )
				.catch( ( error ) => {
					setError( error );
				} );
		}
	}, [] );

	return (
		<AppStore.Provider value={ contextStore }>
			{ ' ' }
			{ children }{ ' ' }
		</AppStore.Provider>
	);
};

export default AppStore;
