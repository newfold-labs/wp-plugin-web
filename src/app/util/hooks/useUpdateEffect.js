import { useEffect, useRef } from '@wordpress/element';

/**
 * Like useEffect, but skips the initial mount and only runs on updates.
 * Local replacement for react-use's useUpdateEffect.
 *
 * @param {Function} effect Effect callback.
 * @param {Array}    deps   Dependency list.
 */
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
