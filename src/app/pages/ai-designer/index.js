import { useEffect, useRef } from '@wordpress/element';
import { createRoot } from '@wordpress/element';

const AIDesigner = () => {
	const containerRef = useRef( null );
	const rootRef = useRef( null );

	useEffect( () => {
		// Check if the AI Page Designer module is loaded
		if ( ! window.nfdAIPageDesigner ) {
			return;
		}

		// Get the AI Page Designer root component from the module's bundle
		// The module should expose its root component on window
		const mountAIDesigner = () => {
			if ( containerRef.current && window.AIPageDesignerApp ) {
				// If the module exposes a React component, render it here
				if ( ! rootRef.current ) {
					rootRef.current = createRoot( containerRef.current );
				}
				rootRef.current.render( <window.AIPageDesignerApp /> );
			}
		};

		// Try to mount immediately
		mountAIDesigner();

		// Also listen for the module to load if it hasn't yet
		const interval = setInterval( () => {
			if ( window.AIPageDesignerApp ) {
				mountAIDesigner();
				clearInterval( interval );
			}
		}, 100 );

		return () => {
			clearInterval( interval );
			if ( rootRef.current ) {
				rootRef.current.unmount();
				rootRef.current = null;
			}
		};
	}, [] );

	return (
		<div 
			className="wppw-ai-designer-wrapper" 
			style={{ 
				height: 'calc(100vh - 180px)',
				overflow: 'hidden'
			}}
		>
			<div
				ref={ containerRef }
				id="nfd-ai-page-designer-mount"
				style={{ height: '100%' }}
			/>
		</div>
	);
};

export default AIDesigner;
