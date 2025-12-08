import { useEffect } from '@wordpress/element';

const PerformancePage = () => {

	useEffect(() => {
		// Register the performance portal when component mounts
		const performancePortal = document.getElementById('performance-portal');
		if (performancePortal && window.NFDPortalRegistry) {
			window.NFDPortalRegistry.registerPortal('performance', performancePortal);
		}

		// Clean up when component unmounts
		return () => {
			if (window.NFDPortalRegistry) {
				window.NFDPortalRegistry.unregisterPortal('performance');
			}
		};
	}, []);

	return (
		<div className="wppw-app-performance-page">
			{/* The performance module will render its complete UI into this div via portal */}
			<div id="performance-portal"></div>
		</div>
	);
};

export default PerformancePage;
