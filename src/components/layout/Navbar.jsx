// src/components/layout/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import useAuth from '../../hooks/useAuth';
import { ROUTES, APP_NAME } from '../../utils/constants';
import Button from '../common/Button';
import { Menu, X, UserCircle, LogOut, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import './Navbar.css';
import LogoutButton from '../common/LogoutButton';

const Navbar = ({ variant = 'public' }) => {
    const { isAuthenticated, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const mobileMenuRef = useRef(null); // For click outside to close

    // const handleLogout = async () => {
    //     closeMobileMenu(); // Close menu before logging out
    //     await logout();
    // };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Click outside to close mobile menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                // Check if the click was on the toggle button itself
                if (!event.target.closest('.mobile-menu-toggle')) {
                    closeMobileMenu();
                }
            }
        };
        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMobileMenuOpen]);


    const publicNavLinks = [
        { to: ROUTES.HOME, label: "Home" }, 
        { to: `${ROUTES.HOME}#plans`, label: "Pricing" }, 
        { to: "/faqs", label: "FAQ" },
    ];

    const userDropdownItems = (isMobile = false) => (
        <>
            <Link to={ROUTES.USER_DASHBOARD} className={isMobile ? "nav-link" : "dropdown-link"} onClick={closeMobileMenu}>Dashboard</Link>
            <Link to={ROUTES.USER_PROFILE} className={isMobile ? "nav-link" : "dropdown-link"} onClick={closeMobileMenu}>Profile</Link>
            {/* <button onClick={handleLogout} className={isMobile ? "nav-link logout-btn-mobile" : "dropdown-link logout-btn-desktop"}>
                <LogOut size={isMobile ? 18 : 16} /> Logout
            </button> */}
            <LogoutButton />
        </>
    );

    return (
        <nav className={`navbar navbar-${variant} ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`}>
            <div className="navbar-container">
                <Link to={isAuthenticated ? ROUTES.USER_DASHBOARD : ROUTES.HOME} className="navbar-logo" onClick={closeMobileMenu}>
                    <span className="logo-text">{APP_NAME}</span>
                </Link>

                {/* Desktop Navigation Menu */}
                <ul className="navbar-menu navbar-menu-desktop">
                    {publicNavLinks.map(link => (
                        <li key={link.to + link.label}>
                            <NavLink
                                to={link.to}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                {link.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {/* Desktop Actions */}
                <div className="navbar-actions navbar-actions-desktop">
                    <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    {isAuthenticated ? (
                        <>
                            <Link to={ROUTES.USER_NOTIFICATIONS} className="nav-icon-btn" aria-label="Notifications">
                                <Bell size={20} />
                                {/* {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>} */}
                            </Link>
                            <div className="user-menu-dropdown-container">
                                <button className="user-menu-trigger">
                                    <UserCircle size={28} />
                                    <span className="user-name-nav">{user?.fullName?.split(' ')[0] || user?.email}</span>
                                </button>
                                <div className="dropdown-content">
                                    {userDropdownItems()}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.LOGIN)}>Login</Button>
                            <Button variant="primary" size="sm" onClick={() => navigate(ROUTES.REGISTER)}>Sign Up</Button>
                        </>
                    )}
                </div>

                <div className="mobile-theme-toggle">
                    <Button variant="ghost" onClick={() => { toggleTheme(); /* closeMobileMenu(); // Optional */ }}>
                        {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
                    </Button>
                </div>

                {/* Mobile Menu Toggle Button */}
                <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

            </div>

            {/* Mobile Navigation Menu (Slide-in or Dropdown) */}
            <div ref={mobileMenuRef} className={`navbar-menu-mobile ${isMobileMenuOpen ? 'open' : ''}`}>
                <ul className="mobile-nav-links">
                    {publicNavLinks.map(link => (
                        <li key={link.to + link.label}>
                            <NavLink
                                to={link.to}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={closeMobileMenu}
                            >
                                {link.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
                <hr className="mobile-menu-divider" />
                <div className="mobile-actions">
                    {isAuthenticated ? (
                        <div className="mobile-user-section">
                            <div className="user-greeting">
                                <UserCircle size={24} />
                                <span >Hello, {user?.fullName?.split(' ')[0] || user?.email}</span>
                            </div>
                            {userDropdownItems(true)}
                        </div>
                    ) : (
                        <>
                            <Button fullWidth variant="primary" onClick={() => { navigate(ROUTES.REGISTER); closeMobileMenu(); }}>Sign Up</Button>
                            <Button fullWidth variant="outline" onClick={() => { navigate(ROUTES.LOGIN); closeMobileMenu(); }}>Login</Button>
                        </>
                    )}
                    <hr className="mobile-menu-divider" />
                    {/* <div className="mobile-theme-toggle">
                        <span>Theme:</span>
                        <Button variant="ghost" onClick={() => { toggleTheme(); }}>
                            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
                            <span style={{ marginLeft: '8px' }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </Button>
                    </div> */}
                </div>
            </div>
        </nav>
    );
};

Navbar.propTypes = {
    variant: PropTypes.oneOf(['public', 'dashboard']),
};

export default Navbar;