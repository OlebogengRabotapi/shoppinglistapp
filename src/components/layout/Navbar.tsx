import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { clearItems } from '../../store/slices/itemsSlice';
import { clearLists } from '../../store/slices/listsSlice';
import { pushToast } from '../../store/slices/toastSlice';

const Navbar = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearLists());
    dispatch(clearItems());
    dispatch(pushToast('info', 'You have been logged out.'));
    closeMenu();
    navigate('/login', { replace: true });
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `nav__link ${isActive ? 'nav__link--active' : ''}`;

  return (
    <header className="nav">
      <div className="nav__inner">
        <Link to="/" className="nav__brand" onClick={closeMenu}>
          <span className="nav__logo" aria-hidden="true">
            🛒
          </span>
          CartCraft
        </Link>

        {user && (
          <>
            <button
              type="button"
              className="nav__toggle"
              aria-expanded={open}
              aria-controls="main-menu"
              aria-label="Toggle menu"
              onClick={() => setOpen((value) => !value)}
            >
              <span className="nav__burger" />
            </button>
            <nav id="main-menu" className={`nav__menu ${open ? 'nav__menu--open' : ''}`}>
              <NavLink to="/" end className={linkClass} onClick={closeMenu}>
                My Lists
              </NavLink>
              <NavLink to="/profile" className={linkClass} onClick={closeMenu}>
                Profile
              </NavLink>
              <span className="nav__user">Hi, {user.name}</span>
              <button type="button" className="btn btn--secondary btn--sm" onClick={handleLogout}>
                Log out
              </button>
            </nav>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
