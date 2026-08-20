import { useEffect, useRef } from '@wordpress/element';

const useUpdateEffect = ( effect, deps ) => {
	const isFirstMount = useRef( true );
	useEffect( () => {
		if ( isFirstMount.current ) {
			isFirstMount.current = false;
			return undefined;
		}
		return effect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps );
};

export default useUpdateEffect;
