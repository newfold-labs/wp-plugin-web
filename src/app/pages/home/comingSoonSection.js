import { useEffect } from '@wordpress/element';
import { Container } from "@newfold/ui-component-library";

const ComingSoonSection = () => {
    const siteKind = window.NewfoldRuntime?.isWoocommerceActive 
  ? 'store' 
  : (window.NewfoldRuntime?.siteType || 'website');

    useEffect(() => {
        // run when mounts
        const comingSoonPortal =
            document.getElementById('coming-soon-portal');

        if (comingSoonPortal) {
            console.log("Home Page 2");
            window.NFDPortalRegistry.registerPortal(
                'coming-soon',
                comingSoonPortal
            );
        }

        // run when unmounts
        return () => {
            window.NFDPortalRegistry.unregisterPortal('coming-soon');
        };
    }, []);

    return (
        siteKind !== 'store' &&
            <Container className="nfd-max-w-full nfd-p-8 nfd-shadow-none nfd-rounded-xl nfd-border nfd-border-[#D5D5D5]">
                <div id="coming-soon-portal" />
            </Container>
    );
};

export default ComingSoonSection;
