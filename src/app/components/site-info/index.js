import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";
import { NewfoldRuntime } from "@newfold/wp-module-runtime";
import { Button } from "@newfold/ui-component-library";
import { WordPressIcon } from "../icons";
import { ReactComponent as NSIcon } from '../../../../assets/svg/ns-icon-image.svg';

export const SiteInfoBar = () => {
    const { url, title } = NewfoldRuntime.siteDetails;
    const parsedUrl = new URL(url);
    const siteDomain = parsedUrl.hostname;
    const hasSSL = parsedUrl.protocol.includes("https");
    const isEcommerce = NewfoldRuntime.hasCapability("isEcommerce");
    const isStore = window.location.href?.includes("store");

    const renderPadLock = () => {
        if (hasSSL) {
            return <LockClosedIcon className="nfd-w-auto nfd-h-3.5 nfd-text-[#1CD67D]" />
        }

        return <LockOpenIcon className="nfd-w-auto nfd-h-3.5 nfd-text-[#d61c1c]" />
    }

    return (
        <div className="wppw-app-site-info nfd-bg-gradient-to-r nfd-from-slate-50 nfd-to-blue-50 nfd-w-full nfd-py-6 nfd-px-8 nfd-mb-8 nfd-border nfd-border-slate-200 nfd-rounded-lg nfd-shadow-sm">
            <div className="nfd-flex nfd-justify-between nfd-items-center nfd-flex-wrap nfd-gap-4">

                <div className="nfd-w-max nfd-flex nfd-flex-col nfd-gap-1.5">
                    <h3 className="nfd-text-slate-900 nfd-text-2xl nfd-font-semibold">{title}</h3>
                    <div className="nfd-flex nfd-items-center nfd-gap-3 nfd-font-medium">
                        <div className="nfd-flex nfd-items-center nfd-gap-1">
                            {renderPadLock()}
                            <span className="nfd-text-slate-700 nfd-text-tiny">{siteDomain}</span>
                        </div>
                    </div>
                </div>

                <div className="nfd-w-max nfd-flex nfd-items-center nfd-flex-wrap nfd-gap-3">
                    <Button 
                        as="a"
                        id="site_info_portal_button"
                        href= { window.NewfoldRuntime.linkTracker.addUtmParams( 'https://www.networksolutions.com/my-account/' ) }
                        target="_blank"
                        variant="primary" 
                        className="nfd-bg-primary nfd-text-white nfd-text-tiny nfd-w-full min-[400px]:nfd-w-auto hover:nfd-bg-primary-dark">
                        <NSIcon />
                        { __("Network Solutions Account", "wp-plugin-web") }
                    </Button>
                    <Button 
                        as="a" 
                        id="site_info_site_button"
                        href={(isEcommerce && isStore) ? window.NewfoldRuntime.linkTracker.addUtmParams(`${url}/shop`) : window.NewfoldRuntime.linkTracker.addUtmParams( url )}
                        target="_blank" 
                        variant="secondary" 
                        className="nfd-bg-white nfd-text-slate-900 nfd-text-tiny nfd-w-full min-[400px]:nfd-w-auto nfd-border-slate-300 hover:nfd-bg-slate-50"
                    >
                        <WordPressIcon />
                       { (isEcommerce && isStore) ? __("View Store", "wp-plugin-web") : __("View Site", "wp-plugin-web") }
                    </Button>
                </div>
                
            </div>
        </div>
    );
}