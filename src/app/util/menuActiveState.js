/**
 * Handle active state for WordPress admin submenu items
 * based on React Router hash-based navigation
 */

if (typeof window !== 'undefined') {
	function updateActiveMenuItem() {
		const hash = window.location.hash.replace('#', '') || '/home';
		
		// Remove all current classes from submenu items
		const submenuItems = document.querySelectorAll('#toplevel_page_web .wp-submenu li');
		submenuItems.forEach(item => {
			item.classList.remove('current');
			const link = item.querySelector('a');
			if (link) {
				link.classList.remove('current');
			}
		});
		
		// Map hash to menu item
		const menuMap = {
			'/home': 'web#/home',
			'/marketplace': 'web#/marketplace',
			'marketplace/services': 'web#/marketplace',
			'marketplace/featured': 'web#/marketplace',
			'marketplace/ecommerce': 'web#/marketplace',
			'marketplace/seo': 'web#/marketplace',
			'marketplace/themes': 'web#/marketplace',
			'marketplace/all': 'web#/marketplace',
			'/settings': 'web#/settings',
			'/settings/performance': 'web#/settings',
			'/help': 'web#/help'
		};
		
		// Find the matching menu item and add current class
		const menuSlug = menuMap[hash] || menuMap['/home'];
		const targetLink = document.querySelector(`#toplevel_page_web .wp-submenu li a[href*="${menuSlug}"]`);
		
		if (targetLink && targetLink.parentElement) {
			targetLink.parentElement.classList.add('current');
			targetLink.classList.add('current');
		}
	}
	
	// Initialize after DOM is ready
	window.addEventListener('DOMContentLoaded', () => {
		// Initial update
		setTimeout(updateActiveMenuItem, 100);
		
		// Update on hash change (for React Router navigation)
		window.addEventListener('hashchange', updateActiveMenuItem);
		
		// Update when clicking submenu items
		const submenuLinks = document.querySelectorAll('#toplevel_page_web .wp-submenu a');
		submenuLinks.forEach(link => {
			link.addEventListener('click', () => {
				setTimeout(updateActiveMenuItem, 50);
			});
		});
		
		// Listen for clicks on React app navigation links
		document.addEventListener('click', (e) => {
			// Check if clicked element or its parent is a navigation link
			const target = e.target.closest('a[href^="#/"], .wppw-app-navitem');
			if (target) {
				setTimeout(updateActiveMenuItem, 50);
			}
		});
		
		// Poll for hash changes (backup for when hashchange doesn't fire)
		let lastHash = window.location.hash;
		setInterval(() => {
			if (window.location.hash !== lastHash) {
				lastHash = window.location.hash;
				updateActiveMenuItem();
			}
		}, 100);
	});
	
	// Also update after a short delay to handle React app initialization
	setTimeout(updateActiveMenuItem, 500);
}

