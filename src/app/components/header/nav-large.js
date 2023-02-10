import classNames from 'classnames';
import { NavLink } from 'react-router-dom';
import { topRoutes } from '../../data/routes';

const NavLarge = () => (
	<ul className="wppcd-nav-large">
		{ topRoutes.map( ( page ) => (
			<li key={ page.name } className="wppcd-nav-large__item">
				<div className="wppcd-nav-large__inner">
					<NavLink
						to={ page.name }
						className={ classNames(
							`wppcd-nav-large__link`,
							`link-${ page.title }`
						) }
					>
						{ page.title }
					</NavLink>
				</div>
			</li>
		) ) }
	</ul>
);

export default NavLarge;
