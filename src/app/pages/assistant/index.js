import {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __, sprintf } from '@wordpress/i18n';
import { NewfoldRuntime } from '@newfold/wp-module-runtime';
import {
	Alert,
	Button,
	Container,
	Page,
	SelectField,
	Title,
	ToggleField,
} from '@newfold/ui-component-library';
import {
	BookOpenIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	InformationCircleIcon,
	ListBulletIcon,
	MagnifyingGlassIcon,
	SparklesIcon,
	XCircleIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import AppStore from '../../data/store';
import './styles.scss';

const knowledgeUrl = () =>
	NewfoldRuntime.createApiUrl( '/newfold-ai-assistant/v1/knowledge' );
const askUrl = () =>
	NewfoldRuntime.createApiUrl( '/newfold-ai-assistant/v1/ask' );
const searchStatsUrl = () =>
	NewfoldRuntime.createApiUrl( '/newfold-ai-assistant/v1/search/stats' );
const searchRebuildUrl = () =>
	NewfoldRuntime.createApiUrl( '/newfold-ai-assistant/v1/search/rebuild' );
const searchSynonymsUrl = () =>
	NewfoldRuntime.createApiUrl( '/newfold-ai-assistant/v1/search/synonyms' );

const assistantDisabledMessage = () =>
	__(
		'The AI Site Assistant is disabled and needs to be enabled from the Features section in Settings.',
		'wp-plugin-web'
	);

const isAssistantUnavailableError = ( err ) => {
	if ( err?.code === 'rest_no_route' || err?.code === 'rest_forbidden' ) {
		return true;
	}
	if ( err?.data?.status === 404 || err?.data?.status === 403 ) {
		return true;
	}
	const message = err?.message || '';
	return message.includes( 'No route was found matching the URL' );
};

const resolveAssistantError = ( err, fallback ) => {
	if ( isAssistantUnavailableError( err ) ) {
		return assistantDisabledMessage();
	}
	return err?.message || fallback;
};

const isAssistantFeatureEnabled = ( store ) => {
	if ( store?.aiSiteAssistant === false ) {
		return false;
	}
	if ( store?.features?.[ 'ai-site-assistant' ] === false ) {
		return false;
	}
	if ( window.NewfoldFeatures?.features?.[ 'ai-site-assistant' ] === false ) {
		return false;
	}
	return true;
};

const tierLabels = {
	rich: __( 'Rich', 'wp-plugin-web' ),
	minimal: __( 'Minimal', 'wp-plugin-web' ),
	insufficient: __( 'Insufficient', 'wp-plugin-web' ),
};

const tierMessages = {
	rich: __( 'Your knowledge profile looks good.', 'wp-plugin-web' ),
	minimal: __(
		'Add more content to improve assistant answers.',
		'wp-plugin-web'
	),
	insufficient: __(
		'The assistant needs more site content before it can go live.',
		'wp-plugin-web'
	),
};

const tierIcons = {
	rich: CheckCircleIcon,
	minimal: ExclamationTriangleIcon,
	insufficient: XCircleIcon,
};

const siteModeOptions = [
	{ value: '', label: __( 'Auto-detect', 'wp-plugin-web' ) },
	{ value: 'business', label: __( 'Business', 'wp-plugin-web' ) },
	{ value: 'personal_blog', label: __( 'Personal blog', 'wp-plugin-web' ) },
	{ value: 'hybrid', label: __( 'Hybrid', 'wp-plugin-web' ) },
];

const formatBuiltAt = ( value ) => {
	if ( ! value ) {
		return __( 'Never', 'wp-plugin-web' );
	}
	const date = new Date( value );
	if ( Number.isNaN( date.getTime() ) ) {
		return value;
	}
	return date.toLocaleString();
};

const synonymMapToText = ( map = {} ) =>
	Object.entries( map )
		.map(
			( [ term, synonyms ] ) =>
				`${ term }: ${ ( synonyms || [] ).join( ', ' ) }`
		)
		.join( '\n' );

const synonymTextToMap = ( text ) =>
	text.split( '\n' ).reduce( ( map, line ) => {
		const [ rawTerm, rawSynonyms ] = line.split( ':' );
		if ( ! rawTerm || ! rawSynonyms ) {
			return map;
		}

		const term = rawTerm.trim();
		const synonyms = rawSynonyms
			.split( ',' )
			.map( ( synonym ) => synonym.trim() )
			.filter( Boolean );

		if ( term && synonyms.length > 0 ) {
			map[ term ] = synonyms;
		}

		return map;
	}, {} );

const StatusBanner = ( { status } ) => {
	const tier = status.quality_tier || 'minimal';
	const TierIcon = tierIcons[ tier ] || ExclamationTriangleIcon;

	return (
		<div
			className={ `wppw-assistant-status-banner wppw-assistant-status-banner--${ tier }` }
		>
			<div className="wppw-assistant-status-banner__main">
				<TierIcon
					className="wppw-assistant-status-banner__icon"
					aria-hidden="true"
				/>
				<div>
					<p className="wppw-assistant-status-banner__title">
						{ tierLabels[ tier ] || tier }
						{ ' — ' }
						{ status.next_tier_hint || tierMessages[ tier ] }
					</p>
					{ status.tier_checklist?.length > 0 && (
						<ul className="wppw-assistant-status-banner__checklist">
							{ status.tier_checklist.map( ( item ) => (
								<li
									key={ item.id }
									className={ item.done ? 'is-done' : '' }
								>
									{ item.label }
								</li>
							) ) }
						</ul>
					) }
					<p className="wppw-assistant-status-banner__meta">
						{ __( 'Site mode:', 'wp-plugin-web' ) }{ ' ' }
						{ status.site_mode }
						{ ' · ' }
						{ __( 'Indexed:', 'wp-plugin-web' ) }{ ' ' }
						{ status.corpus_count }
						{ ' · ' }
						{ __( 'Built:', 'wp-plugin-web' ) }{ ' ' }
						{ formatBuiltAt( status.built_at ) }
					</p>
				</div>
			</div>
			<span className="wppw-assistant-status-banner__badge">
				{ __( 'Feature:', 'wp-plugin-web' ) }{ ' ' }
				{ status.feature_enabled
					? __( 'Enabled', 'wp-plugin-web' )
					: __( 'Disabled', 'wp-plugin-web' ) }
			</span>
			{ ! status.feature_enabled && (
				<Link to="/settings" className="wppw-assistant-card__link">
					{ __( 'Open Settings', 'wp-plugin-web' ) }
				</Link>
			) }
		</div>
	);
};

const AssistantDisabledState = () => (
	<div className="wppw-assistant-status-banner wppw-assistant-status-banner--disabled">
		<div className="wppw-assistant-status-banner__main">
			<XCircleIcon
				className="wppw-assistant-status-banner__icon"
				aria-hidden="true"
			/>
			<div>
				<p className="wppw-assistant-status-banner__title">
					{ __( 'Disabled', 'wp-plugin-web' ) }
					{ ' — ' }
					{ assistantDisabledMessage() }
				</p>
				<p className="wppw-assistant-status-banner__meta">
					{ __(
						'When disabled, the public chat widget is hidden and knowledge settings cannot be loaded.',
						'wp-plugin-web'
					) }
				</p>
			</div>
		</div>
		<div className="wppw-assistant-status-banner__actions">
			<span className="wppw-assistant-status-banner__badge">
				{ __( 'Feature:', 'wp-plugin-web' ) }{ ' ' }
				{ __( 'Disabled', 'wp-plugin-web' ) }
			</span>
			<Button variant="primary" as={ Link } to="/settings">
				{ __( 'Open Settings', 'wp-plugin-web' ) }
			</Button>
		</div>
	</div>
);

const SearchIndexCard = ( {
	status,
	loading,
	rebuilding,
	onRefresh,
	onRebuild,
} ) => {
	const progress = status?.rebuild || {};
	const isRunning = progress.status === 'running';
	const processed = progress.processed || 0;
	const total = progress.total || status?.total_docs || 0;
	const percent =
		total > 0
			? Math.min( 100, Math.round( ( processed / total ) * 100 ) )
			: 0;

	return (
		<div className="wppw-assistant-card">
			<div className="wppw-assistant-card__body">
				<div className="wppw-assistant-card__header">
					<div>
						<Title as="h3" size="4" className="nfd-m-0">
							{ __( 'Search index', 'wp-plugin-web' ) }
						</Title>
						<p className="nfd-text-sm nfd-text-neutral-600 nfd-mt-1 nfd-mb-0">
							{ __(
								'Build the BM25 index used to find relevant pages before the assistant answers.',
								'wp-plugin-web'
							) }
						</p>
					</div>
					<span className="wppw-assistant-status-banner__badge">
						{ isRunning
							? __( 'Rebuilding', 'wp-plugin-web' )
							: __( 'Ready', 'wp-plugin-web' ) }
					</span>
				</div>

				<p className="nfd-text-sm nfd-text-neutral-700 nfd-mb-2">
					{ isRunning
						? sprintf(
								/* translators: 1: processed count, 2: total count, 3: percent complete. */
								__(
									'Rebuilding: %1$d of %2$d items indexed (%3$d%%).',
									'wp-plugin-web'
								),
								processed,
								total,
								percent
						  )
						: sprintf(
								/* translators: %d: indexed document count. */
								__(
									'%d indexed pages and posts.',
									'wp-plugin-web'
								),
								status?.total_docs || 0
						  ) }
				</p>

				{ status?.last_indexed && (
					<p className="nfd-text-xs nfd-text-neutral-500 nfd-mb-0">
						{ sprintf(
							/* translators: %s: last indexed timestamp. */
							__( 'Last indexed: %s', 'wp-plugin-web' ),
							formatBuiltAt( status.last_indexed )
						) }
					</p>
				) }
			</div>
			<div className="wppw-assistant-card__footer nfd-flex nfd-gap-2 nfd-justify-end">
				<Button
					variant="secondary"
					onClick={ onRefresh }
					disabled={ loading || rebuilding }
				>
					{ loading
						? __( 'Refreshing…', 'wp-plugin-web' )
						: __( 'Refresh', 'wp-plugin-web' ) }
				</Button>
				<Button
					variant="primary"
					onClick={ onRebuild }
					disabled={ rebuilding || isRunning }
				>
					{ rebuilding || isRunning
						? __( 'Rebuilding…', 'wp-plugin-web' )
						: __( 'Rebuild index', 'wp-plugin-web' ) }
				</Button>
			</div>
		</div>
	);
};

const SynonymsCard = ( {
	value,
	defaults,
	loading,
	saving,
	onChange,
	onRefresh,
	onSave,
} ) => (
	<div className="wppw-assistant-card">
		<div className="wppw-assistant-card__body">
			<div className="wppw-assistant-card__header">
				<div>
					<Title as="h3" size="4" className="nfd-m-0">
						{ __( 'Search synonyms', 'wp-plugin-web' ) }
					</Title>
					<p className="nfd-text-sm nfd-text-neutral-600 nfd-mt-1 nfd-mb-0">
						{ __(
							'Map visitor wording to the words used on your site, one entry per line.',
							'wp-plugin-web'
						) }
					</p>
				</div>
			</div>

			<textarea
				className="wppw-assistant-card__textarea"
				value={ value }
				onChange={ ( event ) => onChange( event.target.value ) }
				placeholder={ __(
					'timings: hours, opening, open',
					'wp-plugin-web'
				) }
			/>

			{ Object.keys( defaults || {} ).length > 0 && (
				<p className="nfd-text-xs nfd-text-neutral-500 nfd-mt-2 nfd-mb-0">
					{ sprintf(
						/* translators: %s: default synonym examples. */
						__( 'Built-in examples include: %s', 'wp-plugin-web' ),
						synonymMapToText( defaults ).replace( /\n/g, '; ' )
					) }
				</p>
			) }
		</div>
		<div className="wppw-assistant-card__footer nfd-flex nfd-gap-2 nfd-justify-end">
			<Button
				variant="secondary"
				onClick={ onRefresh }
				disabled={ loading || saving }
			>
				{ loading
					? __( 'Refreshing…', 'wp-plugin-web' )
					: __( 'Refresh', 'wp-plugin-web' ) }
			</Button>
			<Button
				variant="primary"
				onClick={ onSave }
				disabled={ loading || saving }
			>
				{ saving
					? __( 'Saving…', 'wp-plugin-web' )
					: __( 'Save synonyms', 'wp-plugin-web' ) }
			</Button>
		</div>
	</div>
);

const AssistantKnowledge = () => {
	const { store } = useContext( AppStore );
	const isFeatureEnabled = useMemo(
		() => isAssistantFeatureEnabled( store ),
		[ store ]
	);
	const [ loading, setLoading ] = useState( true );
	const [ saving, setSaving ] = useState( false );
	const [ rebuilding, setRebuilding ] = useState( false );
	const [ improving, setImproving ] = useState( false );
	const [ searchIndexLoading, setSearchIndexLoading ] = useState( false );
	const [ searchIndexRebuilding, setSearchIndexRebuilding ] =
		useState( false );
	const [ synonymsLoading, setSynonymsLoading ] = useState( false );
	const [ synonymsSaving, setSynonymsSaving ] = useState( false );
	const [ error, setError ] = useState( '' );
	const [ notice, setNotice ] = useState( '' );
	const [ status, setStatus ] = useState( null );
	const [ searchIndexStatus, setSearchIndexStatus ] = useState( null );
	const [ synonymDefaults, setSynonymDefaults ] = useState( {} );
	const [ synonymText, setSynonymText ] = useState( '' );

	const [ businessDescription, setBusinessDescription ] = useState( '' );
	const [ curatedFacts, setCuratedFacts ] = useState( '' );
	const [ siteModeOverride, setSiteModeOverride ] = useState( '' );
	const [ customCtas, setCustomCtas ] = useState( [] );
	const [ hiddenCtaUrls, setHiddenCtaUrls ] = useState( [] );

	const [ previewQuestion, setPreviewQuestion ] = useState( '' );
	const [ previewResponse, setPreviewResponse ] = useState( null );
	const [ previewLoading, setPreviewLoading ] = useState( false );
	const [ unavailable, setUnavailable ] = useState( false );
	const [ activeTab, setActiveTab ] = useState( 0 );

	const isBlogMode = status?.site_mode === 'personal_blog';
	const showDisabledState = ! isFeatureEnabled || unavailable;

	const loadSearchIndexStatus = useCallback( async () => {
		if ( ! isAssistantFeatureEnabled( store ) ) {
			return;
		}

		setSearchIndexLoading( true );
		try {
			const data = await apiFetch( { url: searchStatsUrl() } );
			setSearchIndexStatus( data );
		} catch ( err ) {
			setError(
				resolveAssistantError(
					err,
					__( 'Unable to load search index status.', 'wp-plugin-web' )
				)
			);
		} finally {
			setSearchIndexLoading( false );
		}
	}, [ store ] );

	const loadSynonyms = useCallback( async () => {
		if ( ! isAssistantFeatureEnabled( store ) ) {
			return;
		}

		setSynonymsLoading( true );
		try {
			const data = await apiFetch( { url: searchSynonymsUrl() } );
			setSynonymDefaults( data.defaults || {} );
			setSynonymText( synonymMapToText( data.custom || {} ) );
		} catch ( err ) {
			setError(
				resolveAssistantError(
					err,
					__( 'Unable to load search synonyms.', 'wp-plugin-web' )
				)
			);
		} finally {
			setSynonymsLoading( false );
		}
	}, [ store ] );

	const loadKnowledge = useCallback( async () => {
		if ( ! isAssistantFeatureEnabled( store ) ) {
			setLoading( false );
			setUnavailable( false );
			setError( '' );
			return;
		}

		setLoading( true );
		setError( '' );
		setUnavailable( false );
		try {
			const data = await apiFetch( { url: knowledgeUrl() } );
			setStatus( data );
			setBusinessDescription( data.business_description || '' );
			setCuratedFacts( data.curated_facts || '' );
			setSiteModeOverride( data.site_mode_override || '' );
			setCustomCtas(
				data.custom_ctas?.length
					? data.custom_ctas
					: [ { label: '', url: '' } ]
			);
			setHiddenCtaUrls( data.hidden_cta_urls || [] );
		} catch ( err ) {
			if ( isAssistantUnavailableError( err ) ) {
				setUnavailable( true );
				setError( '' );
			} else {
				setError(
					resolveAssistantError(
						err,
						__(
							'Unable to load assistant knowledge.',
							'wp-plugin-web'
						)
					)
				);
			}
		} finally {
			setLoading( false );
		}
	}, [ store ] );

	useEffect( () => {
		if ( ! isFeatureEnabled ) {
			setLoading( false );
			setUnavailable( false );
			setStatus( null );
			setSearchIndexStatus( null );
			setSynonymDefaults( {} );
			setSynonymText( '' );
			setError( '' );
			return;
		}

		loadKnowledge();
		loadSearchIndexStatus();
		loadSynonyms();
	}, [
		isFeatureEnabled,
		loadKnowledge,
		loadSearchIndexStatus,
		loadSynonyms,
	] );

	useEffect( () => {
		if ( searchIndexStatus?.rebuild?.status !== 'running' ) {
			return undefined;
		}

		const interval = setInterval( loadSearchIndexStatus, 5000 );
		return () => clearInterval( interval );
	}, [ searchIndexStatus?.rebuild?.status, loadSearchIndexStatus ] );

	const autoDetectedCtas = useMemo( () => {
		if ( ! status?.ctas_catalog ) {
			return [];
		}
		const customUrls = new Set(
			( status.custom_ctas || [] ).map( ( c ) => c.url )
		);
		return status.ctas_catalog.filter(
			( cta ) => ! customUrls.has( cta.url )
		);
	}, [ status ] );

	const totalCtaCount =
		autoDetectedCtas.length +
		customCtas.filter( ( c ) => c.label && c.url ).length;

	const saveKnowledge = async () => {
		setSaving( true );
		setNotice( '' );
		setError( '' );
		try {
			const data = await apiFetch( {
				url: knowledgeUrl(),
				method: 'PUT',
				data: {
					business_description: businessDescription,
					curated_facts: curatedFacts,
					site_mode_override: siteModeOverride,
					custom_ctas: customCtas.filter( ( c ) => c.label && c.url ),
					hidden_cta_urls: hiddenCtaUrls,
				},
			} );
			setStatus( data );
			setNotice( __( 'Knowledge settings saved.', 'wp-plugin-web' ) );
		} catch ( err ) {
			setError(
				resolveAssistantError(
					err,
					__( 'Unable to save knowledge settings.', 'wp-plugin-web' )
				)
			);
		} finally {
			setSaving( false );
		}
	};

	const rebuildKnowledge = async () => {
		setRebuilding( true );
		setNotice( '' );
		setError( '' );
		try {
			const data = await apiFetch( {
				url: NewfoldRuntime.createApiUrl(
					'/newfold-ai-assistant/v1/knowledge/rebuild'
				),
				method: 'POST',
			} );
			setStatus( data );
			setNotice( __( 'Knowledge snapshot rebuilt.', 'wp-plugin-web' ) );
		} catch ( err ) {
			setError(
				resolveAssistantError(
					err,
					__( 'Unable to rebuild knowledge.', 'wp-plugin-web' )
				)
			);
		} finally {
			setRebuilding( false );
		}
	};

	const rebuildSearchIndex = async () => {
		setSearchIndexRebuilding( true );
		setNotice( '' );
		setError( '' );
		try {
			const data = await apiFetch( {
				url: searchRebuildUrl(),
				method: 'POST',
			} );
			setSearchIndexStatus( data.stats || null );
			setNotice( __( 'Search index rebuild started.', 'wp-plugin-web' ) );
		} catch ( err ) {
			setError(
				resolveAssistantError(
					err,
					__( 'Unable to rebuild search index.', 'wp-plugin-web' )
				)
			);
		} finally {
			setSearchIndexRebuilding( false );
		}
	};

	const saveSynonyms = async () => {
		setSynonymsSaving( true );
		setNotice( '' );
		setError( '' );
		try {
			const data = await apiFetch( {
				url: searchSynonymsUrl(),
				method: 'POST',
				data: {
					synonyms: synonymTextToMap( synonymText ),
				},
			} );
			setSynonymText( synonymMapToText( data.custom || {} ) );
			setNotice( __( 'Search synonyms saved.', 'wp-plugin-web' ) );
		} catch ( err ) {
			setError(
				resolveAssistantError(
					err,
					__( 'Unable to save search synonyms.', 'wp-plugin-web' )
				)
			);
		} finally {
			setSynonymsSaving( false );
		}
	};

	const improveDescription = async () => {
		setImproving( true );
		setNotice( '' );
		setError( '' );
		try {
			const data = await apiFetch( {
				url: NewfoldRuntime.createApiUrl(
					'/newfold-ai-assistant/v1/knowledge/improve-description'
				),
				method: 'POST',
			} );
			setStatus( data );
			if ( data.suggested_description ) {
				setBusinessDescription( data.suggested_description );
			}
			setNotice(
				__(
					'Description updated from homepage content.',
					'wp-plugin-web'
				)
			);
		} catch ( err ) {
			setError(
				resolveAssistantError(
					err,
					__( 'Unable to improve description.', 'wp-plugin-web' )
				)
			);
		} finally {
			setImproving( false );
		}
	};

	const toggleHiddenCta = ( url, hidden ) => {
		setHiddenCtaUrls( ( current ) => {
			if ( hidden ) {
				return current.includes( url ) ? current : [ ...current, url ];
			}
			return current.filter( ( item ) => item !== url );
		} );
	};

	const updateCustomCta = ( index, field, value ) => {
		setCustomCtas( ( current ) =>
			current.map( ( cta, i ) =>
				i === index ? { ...cta, [ field ]: value } : cta
			)
		);
	};

	const addCustomCta = () => {
		if ( customCtas.length >= 6 ) {
			return;
		}
		setCustomCtas( ( current ) => [ ...current, { label: '', url: '' } ] );
	};

	const runPreview = async () => {
		if ( ! previewQuestion.trim() ) {
			return;
		}
		setPreviewLoading( true );
		setPreviewResponse( null );
		setError( '' );
		try {
			const data = await apiFetch( {
				url: askUrl(),
				method: 'POST',
				data: {
					question: previewQuestion.trim(),
					preview: true,
				},
			} );
			setPreviewResponse( data );
		} catch ( err ) {
			setError(
				resolveAssistantError(
					err,
					__( 'Preview request failed.', 'wp-plugin-web' )
				)
			);
		} finally {
			setPreviewLoading( false );
		}
	};

	return (
		<Page
			title={ __( 'AI Site Assistant', 'wp-plugin-web' ) }
			className="wppw-assistant-knowledge-page"
		>
			<Container className="wppw-assistant-knowledge nfd-p-0">
				<Container.Header>
					<div className="wppw-assistant-page-header">
						<div className="wppw-assistant-page-header__icon-wrap">
							<SparklesIcon
								className="wppw-assistant-page-header__icon"
								aria-hidden="true"
							/>
						</div>
						<div className="wppw-assistant-page-header__text">
							<div className="wppw-assistant-page-header__title-row">
								<Title as="h2" className="nfd-m-0">
									{ __( 'AI Site Assistant', 'wp-plugin-web' ) }
								</Title>
								<span className="wppw-assistant-page-header__badge">
									{ __( 'AI-Powered', 'wp-plugin-web' ) }
								</span>
							</div>
							<p className="wppw-assistant-page-header__description">
								{ __(
									'Customize what your assistant knows, how it searches, and preview responses live.',
									'wp-plugin-web'
								) }
							</p>
						</div>
					</div>
				</Container.Header>

				{ error && ! showDisabledState && (
					<Container.Block>
						<Alert variant="error">{ error }</Alert>
					</Container.Block>
				) }

				{ notice && (
					<Container.Block>
						<Alert variant="success">{ notice }</Alert>
					</Container.Block>
				) }

				{ loading && ! showDisabledState && (
					<Container.Block>
						<p className="wppw-assistant-loading">
							{ __(
								'Loading knowledge profile…',
								'wp-plugin-web'
							) }
						</p>
					</Container.Block>
				) }

				{ showDisabledState && ! loading && (
					<Container.Block>
						<AssistantDisabledState />
					</Container.Block>
				) }

				{ ! loading && status && isFeatureEnabled && ! unavailable && (
					<>
						<Container.Block>
							<StatusBanner status={ status } />
						</Container.Block>

						<Container.Block>
							<div className="wppw-assistant-card wppw-assistant-preview">
								<div className="wppw-assistant-card__body">
									<Title
										as="h3"
										size="4"
										className="wppw-assistant-preview__title"
									>
										<SparklesIcon
											className="wppw-assistant-preview__title-icon"
											aria-hidden="true"
										/>
										{ __( 'Preview assistant', 'wp-plugin-web' ) }
									</Title>
									<p className="nfd-text-sm nfd-text-neutral-600 nfd-mb-4">
										{ __(
											'Try a visitor question using the current knowledge profile.',
											'wp-plugin-web'
										) }
									</p>
									<div className="wppw-assistant-preview__input-row">
										<input
											type="text"
											className="wppw-assistant-preview__input"
											value={ previewQuestion }
											onChange={ ( e ) =>
												setPreviewQuestion(
													e.target.value
												)
											}
											placeholder={ __(
												'What services do you offer?',
												'wp-plugin-web'
											) }
											onKeyDown={ ( e ) => {
												if ( e.key === 'Enter' ) {
													runPreview();
												}
											} }
										/>
										<Button
											variant="secondary"
											onClick={ runPreview }
											disabled={ previewLoading }
										>
											{ previewLoading
												? __(
														'Asking…',
														'wp-plugin-web'
												  )
												: __( 'Ask', 'wp-plugin-web' ) }
										</Button>
									</div>
									{ previewResponse && (
										<div className="wppw-assistant-preview__response">
											<p>{ previewResponse.answer }</p>
											{ previewResponse.suggestions
												?.length > 0 && (
												<p className="wppw-assistant-preview__meta">
													<strong>
														{ __(
															'Suggestions:',
															'wp-plugin-web'
														) }
													</strong>{ ' ' }
													{ previewResponse.suggestions.join(
														' · '
													) }
												</p>
											) }
											{ previewResponse.ctas?.length >
												0 && (
												<p className="wppw-assistant-preview__meta">
													<strong>
														{ __(
															'CTAs:',
															'wp-plugin-web'
														) }
													</strong>{ ' ' }
													{ previewResponse.ctas
														.map( ( c ) => c.label )
														.join( ' · ' ) }
												</p>
											) }
										</div>
									) }
								</div>
							</div>
						</Container.Block>

						<div className="wppw-assistant-tabs-nav">
							<button
								type="button"
								className={ `wppw-assistant-tab-btn ${ activeTab === 0 ? 'is-active' : '' }` }
								onClick={ () => setActiveTab( 0 ) }
							>
								<MagnifyingGlassIcon aria-hidden="true" />
								{ __( 'Search', 'wp-plugin-web' ) }
							</button>
							<button
								type="button"
								className={ `wppw-assistant-tab-btn ${ activeTab === 1 ? 'is-active' : '' }` }
								onClick={ () => setActiveTab( 1 ) }
							>
								<BookOpenIcon aria-hidden="true" />
								{ __( 'Knowledge', 'wp-plugin-web' ) }
							</button>
						</div>

						<div
							className={ `wppw-assistant-tab-panel ${ activeTab === 0 ? 'is-active' : '' }` }
						>
							<Container.Block>
								<SearchIndexCard
									status={ searchIndexStatus }
									loading={ searchIndexLoading }
									rebuilding={ searchIndexRebuilding }
									onRefresh={ loadSearchIndexStatus }
									onRebuild={ rebuildSearchIndex }
								/>
							</Container.Block>

							<Container.Block>
								<SynonymsCard
									value={ synonymText }
									defaults={ synonymDefaults }
									loading={ synonymsLoading }
									saving={ synonymsSaving }
									onChange={ setSynonymText }
									onRefresh={ loadSynonyms }
									onSave={ saveSynonyms }
								/>
							</Container.Block>
						</div>

						<div
							className={ `wppw-assistant-tab-panel ${ activeTab === 1 ? 'is-active' : '' }` }
						>
							<Container.Block>
								<div className="wppw-assistant-grid">
									<div className="wppw-assistant-card">
										<div className="wppw-assistant-card__body">
											<h3 className="wppw-assistant-card__title">
												<InformationCircleIcon
													className="wppw-assistant-card__title-icon"
													aria-hidden="true"
												/>
												{ isBlogMode
													? __(
															'Site description',
															'wp-plugin-web'
													  )
													: __(
															'Business description',
															'wp-plugin-web'
													  ) }
											</h3>
											<textarea
												id="assistant-description"
												className="wppw-assistant-card__textarea"
												value={ businessDescription }
												onChange={ ( e ) =>
													setBusinessDescription(
														e.target.value
													)
												}
												placeholder={
													isBlogMode
														? __(
																'Describe your blog and what you write about…',
																'wp-plugin-web'
														  )
														: __(
																'Describe your business in 1–2 sentences…',
																'wp-plugin-web'
														  )
												}
											/>
										</div>
										<div className="wppw-assistant-card__footer">
											<Button
												variant="secondary"
												className="nfd-w-full"
												onClick={ improveDescription }
												disabled={ improving }
											>
												<SparklesIcon
													className="nfd-w-4 nfd-h-4 nfd-mr-2"
													aria-hidden="true"
												/>
												{ improving
													? __(
															'Improving…',
															'wp-plugin-web'
													  )
													: __(
															'Improve with AI',
															'wp-plugin-web'
													  ) }
											</Button>
										</div>
									</div>

									<div className="wppw-assistant-card">
										<div className="wppw-assistant-card__body">
											<h3 className="wppw-assistant-card__title">
												<ListBulletIcon
													className="wppw-assistant-card__title-icon"
													aria-hidden="true"
												/>
												{ __(
													'Curated facts',
													'wp-plugin-web'
												) }
											</h3>
											<textarea
												id="assistant-curated"
												className="wppw-assistant-card__textarea"
												value={ curatedFacts }
												onChange={ ( e ) =>
													setCuratedFacts(
														e.target.value
													)
												}
												placeholder={ __(
													'Hours, contact info, policies, pricing notes…',
													'wp-plugin-web'
												) }
											/>
										</div>
									</div>
								</div>
							</Container.Block>

							<Container.Block>
								<div className="wppw-assistant-card">
									<div className="wppw-assistant-card__body">
										<p className="wppw-assistant-card__eyebrow">
											{ __(
												'Site mode override',
												'wp-plugin-web'
											) }
										</p>
										<SelectField
											id="assistant-site-mode"
											label={ __(
												'Detection mode',
												'wp-plugin-web'
											) }
											value={ siteModeOverride }
											selectedLabel={
												siteModeOptions.find(
													( option ) =>
														option.value ===
														siteModeOverride
												)?.label
											}
											options={ siteModeOptions }
											onChange={ setSiteModeOverride }
										/>
									</div>
								</div>
							</Container.Block>

							<Container.Block>
								<div className="wppw-assistant-card">
									<div className="wppw-assistant-card__body">
										<div className="wppw-assistant-card__header">
											<Title
												as="h3"
												size="4"
												className="nfd-m-0"
											>
												{ __(
													'CTAs catalog',
													'wp-plugin-web'
												) }
											</Title>
											{ totalCtaCount > 0 && (
												<span className="wppw-assistant-card__link">
													{ __(
														'Manage all',
														'wp-plugin-web'
													) }{ ' ' }
													({ totalCtaCount })
												</span>
											) }
										</div>

										{ autoDetectedCtas.map( ( cta ) => (
											<div
												key={ cta.url }
												className="wppw-assistant-cta-row"
											>
												<div className="wppw-assistant-cta-row__content">
													<span className="wppw-assistant-cta-row__label">
														{ cta.label }
													</span>
													<span className="wppw-assistant-cta-row__url">
														{ cta.url }
													</span>
												</div>
												<div className="wppw-assistant-cta-row__toggle">
													<ToggleField
														id={ `cta-hide-${ cta.url }` }
														label={ __(
															'Visible',
															'wp-plugin-web'
														) }
														checked={
															! hiddenCtaUrls.includes(
																cta.url
															)
														}
														onChange={ ( checked ) =>
															toggleHiddenCta(
																cta.url,
																! checked
															)
														}
													/>
												</div>
											</div>
										) ) }

										{ customCtas.length > 0 && (
											<div className="nfd-mt-4 nfd-pt-4 nfd-border-t nfd-border-neutral-200">
												<p className="wppw-assistant-card__eyebrow nfd-mb-3">
													{ __(
														'Custom CTAs',
														'wp-plugin-web'
													) }
												</p>
												{ customCtas.map(
													( cta, index ) => (
														<div
															key={ `custom-cta-${ index }` }
															className="wppw-assistant-custom-cta nfd-mb-3"
														>
															<input
																type="text"
																placeholder={ __(
																	'Label',
																	'wp-plugin-web'
																) }
																value={ cta.label }
																onChange={ ( e ) =>
																	updateCustomCta(
																		index,
																		'label',
																		e.target
																			.value
																	)
																}
															/>
															<input
																type="url"
																placeholder={ __(
																	'URL',
																	'wp-plugin-web'
																) }
																value={ cta.url }
																onChange={ ( e ) =>
																	updateCustomCta(
																		index,
																		'url',
																		e.target
																			.value
																	)
																}
															/>
														</div>
													)
												) }
											</div>
										) }

										<Button
											variant="secondary"
											onClick={ addCustomCta }
											disabled={ customCtas.length >= 6 }
										>
											{ __(
												'Add custom CTA',
												'wp-plugin-web'
											) }
										</Button>
									</div>
								</div>
							</Container.Block>

							<Container.Block>
								<div className="wppw-assistant-actions">
									<Button
										variant="secondary"
										onClick={ rebuildKnowledge }
										disabled={ rebuilding }
									>
										{ rebuilding
											? __( 'Rebuilding…', 'wp-plugin-web' )
											: __( 'Rebuild now', 'wp-plugin-web' ) }
									</Button>
									<Button
										variant="primary"
										onClick={ saveKnowledge }
										disabled={ saving }
									>
										{ saving
											? __( 'Saving…', 'wp-plugin-web' )
											: __(
													'Save knowledge',
													'wp-plugin-web'
											  ) }
									</Button>
								</div>
							</Container.Block>
						</div>

					</>
				) }
			</Container>
		</Page>
	);
};

export default AssistantKnowledge;
