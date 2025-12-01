import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useViewportMatch } from '@wordpress/compose';
import { addQueryArgs } from '@wordpress/url';
import { filter } from 'lodash';
import { Modal, SidebarNavigation } from "@newfold/ui-component-library"
import { NavLink, useLocation } from 'react-router-dom';
import { Bars3Icon } from "@heroicons/react/24/outline";
import { topRoutes, utilityRoutes } from "../../data/routes";
import Logo from "./logo";
import { default as NewfoldNotifications } from '@modules/wp-module-notifications/assets/js/components/notifications/';

export const SideNavHeader = () => {
	return (
		<header className="nfd-pt-2 nfd-px-3 nfd-mb-6 nfd-space-y-6">
			<Logo />
		</header>
	);
}

export const SideNavMenu = () => {
	const location = useLocation();

	const primaryMenu = () => {
		return (
			<ul className="nfd-flex nfd-flex-col nfd-gap-1.5">
				{topRoutes.map(
					(page) => (
						true === page.condition && (
							<SideNavMenuItem
								key={page.name}
								label={page.title}
								name={page.name}
								icon={page.Icon}
								path={page.name}
								action={page.action}
								subItems={page.subRoutes}
							/>
						)
				))}
			</ul>
		);
	}

	const secondaryMenu = () => {
		return (
			<ul className="nfd-flex nfd-flex-col nfd-gap-1.5 nfd-mt-4 nfd-pt-4 nfd-border-t nfd-border-[#D8DEE4]">
				{utilityRoutes.map((page) => (

					<SideNavMenuItem
						key={page.name}
						label={page.title}
						name={page.name}
						icon={page.Icon}
						path={page.name}
						action={page.action}
						subItems={page.subRoutes}
					/>

				))}
			</ul>
		);
	}

	const SubMenusManager = () => {
		// close any open submenus
		const subMenus = document.querySelectorAll('.wppw-app-navitem-submenu');
		subMenus.forEach((subMenu) => {
			subMenu.classList.add('nfd-hidden');
		});

		// open active's submenu if it exists
		const activeMenu = document.querySelector('.wppw-app-sidenav .active');
		if (
			activeMenu && 
			null !== activeMenu.nextSibling && 
			activeMenu.nextSibling.classList.contains('wppw-app-navitem-submenu')
		) {
			activeMenu.nextSibling.classList.remove('nfd-hidden');
		}
	}

	useEffect(() => {
		SubMenusManager();
		document.onclick = SubMenusManager;
	}, [location]);

	return (
		<div className="nfd-px-0.5 nfd-space-y-6">
			{primaryMenu()}
			{secondaryMenu()}
		</div>
	);
}

export const SideNavMenuItem = ({ label, name, icon: Icon = null, path, action, subItems }) => {
	return (
		<li className="nfd-mb-0">
			<NavLink
				onClick={(action && action instanceof Function) ? action : null}
				to={path}
				className={`wppw-app-navitem wppw-app-navitem-${label} nfd-flex nfd-items-center nfd-gap-3 nfd-px-3 nfd-py-2 nfd-rounded-md nfd-text-sm nfd-font-medium nfd-text-title leading-none hover:nfd-bg-slate-50 [&.active]:nfd-bg-[#E2E8F0]`}
			>
				{Icon &&
					<Icon className="nfd-flex-shrink-0 nfd--ml-1 nfd-h-6 nfd-w-6" />
				}
				{label}
			</NavLink>

			{subItems && subItems.length > 0 &&
				<ul className="wppw-app-navitem-submenu nfd-hidden nfd-ml-8 nfd-m-2 nfd-space-y-1.5">
					{subItems.map((subItem) => (
						<SideNavMenuSubItem
							key={subItem.name}
							label={subItem.title}
							name={subItem.name}
							path={subItem.name}
							action={subItem.action}
						/>
					))}
				</ul>
			}
		</li>
	);
}

export const SideNavMenuSubItem = ({ label, name, path, action }) => {
	return (
		<li className="nfd-m-0 nfd-pb-1">
			<NavLink
				onClick={(action && action instanceof Function) ? action : null}
				to={path} 
				className={`wppw-app-subnavitem wppw-app-subnavitem-${label} nfd-flex nfd-items-center nfd-gap-3 nfd-px-3 nfd-py-2 nfd-rounded-md nfd-text-sm nfd-font-medium nfd-text-body leading-none hover:nfd-bg-slate-50 [&.active]:nfd-bg-[#E2E8F0] [&.active]:nfd-text-title`}
			>
				{label}
			</NavLink>
		</li>
	);
}

export const SideNav = () => {
	const  location = useLocation();
	const hashedPath = '#' + location.pathname;
	return (
		<aside className="wppw-app-sidenav nfd-shrink-0 nfd-hidden min-[783px]:nfd-block nfd-pb-6 nfd-bottom-0 nfd-w-56">
			<SidebarNavigation>
				<SidebarNavigation.Sidebar>
					<SideNavHeader />
					<SideNavMenu />
				</SidebarNavigation.Sidebar>
			</SidebarNavigation>
			<NewfoldNotifications
				constants={ {
					context: 'web-app-nav',
					page: hashedPath,
				} }
				methods={ {
					apiFetch,
					addQueryArgs,
					filter,
					useState,
					useEffect,
				} }
			/>
		</aside>
	);
};

export const MobileNav = () => {
	const [isOpen, setIsOpen] = useState(false);

	let location = useLocation();
	// Close mobile nav when location changes
	useEffect(() => {
		setIsOpen(false);
	}, [location]);

	return (
		<header className="nfd-sticky nfd-z-30 nfd-top-0 min-[600px]:nfd-top-[46px] nfd-border-b nfd-border-line">
			<div className="nfd-flex nfd-justify-between nfd-items-center nfd-bg-white">

				<div className="nfd-px-4">
					<Logo />
				</div>
				<button
					id="nfd-app-mobile-nav"
					role="button"
					className="nfd-h-16 nfd-px-4 nfd-text-body nfd-flex nfd-items-center focus:nfd-outline-none focus:nfd-ring-2 focus:nfd-ring-inset focus:nfd-ring-primary"
					onClick={() => { setIsOpen(true) }}
				>
					<span className="nfd-sr-only">Open Navingation Menu</span>
					<Bars3Icon className="nfd-w-6 nfd-h-6" />
				</button>

				<Modal
					isOpen={isOpen}
					onClose={() => setIsOpen(false)}
					className="wppw-app-sidenav-mobile nfd-z-40"
					initialFocus
				>
					<Modal.Panel className="nfd-p-0 nfd-overflow-visible">
						<div className="wppw-app-sidenav nfd-p-5 nfd-max-h-[70vh] nfd-overflow-y-auto">
							<SideNavMenu />
						</div>
					</Modal.Panel>
				</Modal>

			</div>
		</header>
	);
}

export const TopBarNav = () => {
	const [isOpen, setIsOpen] = useState(false);
	const isLargeViewport = useViewportMatch('medium');
	let location = useLocation();
	const hashedPath = '#' + location.pathname;
	
	// Close mobile nav when location changes
	useEffect(() => {
		setIsOpen(false);
	}, [location]);

	return (
		<header className="wppw-app-topbar nfd-border-b nfd-border-line nfd-bg-white nfd-shadow-sm">
			<div className="nfd-flex nfd-justify-between nfd-items-center nfd-px-4 nfd-h-16">
				<div className="nfd-flex nfd-items-center nfd-gap-8">
					<div className="nfd-shrink-0">
						<Logo />
					</div>
					
					{/* Desktop Navigation - Horizontal Menu */}
					{isLargeViewport && (
						<nav className="nfd-hidden min-[783px]:nfd-flex nfd-items-center nfd-gap-1">
							{topRoutes.map(
								(page) => (
									true === page.condition && (
										<NavLink
											key={page.name}
											onClick={(page.action && page.action instanceof Function) ? page.action : null}
											to={page.name}
											className={`wppw-app-navitem wppw-app-navitem-${page.title} nfd-flex nfd-items-center nfd-gap-2 nfd-px-3 nfd-py-2 nfd-rounded-md nfd-text-sm nfd-font-medium nfd-text-title leading-none hover:nfd-bg-slate-50 [&.active]:nfd-bg-[#E2E8F0] nfd-transition-colors`}
										>
											{page.Icon && <page.Icon className="nfd-w-5 nfd-h-5" />}
											{page.title}
										</NavLink>
									)
							))}
							<div className="nfd-h-6 nfd-w-px nfd-bg-[#D8DEE4] nfd-mx-2"></div>
							{utilityRoutes.map((page) => (
								<NavLink
									key={page.name}
									onClick={(page.action && page.action instanceof Function) ? page.action : null}
									to={page.name}
									className={`wppw-app-navitem wppw-app-navitem-${page.title} nfd-flex nfd-items-center nfd-gap-2 nfd-px-3 nfd-py-2 nfd-rounded-md nfd-text-sm nfd-font-medium nfd-text-title leading-none hover:nfd-bg-slate-50 [&.active]:nfd-bg-[#E2E8F0] nfd-transition-colors`}
								>
									{page.Icon && <page.Icon className="nfd-w-5 nfd-h-5" />}
									{page.title}
								</NavLink>
							))}
						</nav>
					)}
				</div>

				{/* Mobile Menu Button */}
				{!isLargeViewport && (
					<button
						id="nfd-app-mobile-nav"
						role="button"
						className="nfd-h-16 nfd-px-4 nfd-text-body nfd-flex nfd-items-center focus:nfd-outline-none focus:nfd-ring-2 focus:nfd-ring-inset focus:nfd-ring-primary min-[783px]:nfd-hidden"
						onClick={() => { setIsOpen(true) }}
					>
						<span className="nfd-sr-only">Open Navigation Menu</span>
						<Bars3Icon className="nfd-w-6 nfd-h-6" />
					</button>
				)}

				{/* Mobile Navigation Modal */}
				<Modal
					isOpen={isOpen}
					onClose={() => setIsOpen(false)}
					className="wppw-app-sidenav-mobile nfd-z-40"
					initialFocus
				>
					<Modal.Panel className="nfd-p-0 nfd-overflow-visible">
						<div className="wppw-app-sidenav nfd-p-5 nfd-max-h-[70vh] nfd-overflow-y-auto">
							<SideNavMenu />
						</div>
					</Modal.Panel>
				</Modal>
			</div>

			{/* Notifications for desktop */}
			{isLargeViewport && (
				<div className="nfd-hidden">
					<NewfoldNotifications
						constants={ {
							context: 'web-app-nav',
							page: hashedPath,
						} }
						methods={ {
							apiFetch,
							addQueryArgs,
							filter,
							useState,
							useEffect,
						} }
					/>
				</div>
			)}
		</header>
	);
}

export const AppNav = () => {
	return <TopBarNav />;
}