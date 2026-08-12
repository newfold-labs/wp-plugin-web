import { Container } from '@newfold/ui-component-library';
import { useEffect } from '@wordpress/element';

const NextSteps = () => {
   
	useEffect( () => {
		// run when mounts
		const nextStepsPortal = document.getElementById( 'next-steps-portal' );

		if ( nextStepsPortal ) {
			window.NFDPortalRegistry.registerPortal(
				'next-steps',
				nextStepsPortal
			);
		}

		// run when unmounts
		return () => {
			window.NFDPortalRegistry.unregisterPortal( 'next-steps' );
		};
	}, [] );
    
    return <Container className="nfd-max-w-full nfd-p-8 nfd-shadow-none nfd-rounded-xl nfd-border nfd-border-[#D5D5D5]">
                    <div id="next-steps-portal" />
            </Container>;
}

export default NextSteps;