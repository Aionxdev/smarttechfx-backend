// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { APP_NAME, ROUTES } from '../../utils/constants';
import { LayoutDashboard, Users, Briefcase, DollarSign, Settings, BarChart3, MessageSquareWarning, LogOut, LifeBuoy } from 'lucide-react';
import './Sidebar.css'; // Assuming Sidebar.css for styles
// import useAuth from '../../hooks/useAuth';
import LogoutButton from '../common/LogoutButton';

const Sidebar = ({ navItems = [], isOpen, toggleSidebar }) => {
    // const { logout } = useAuth();

    const handleNavLinkClick = () => {
        if (window.innerWidth <= 992) { // Only toggle on mobile
            toggleSidebar();
        }
    };

    // const handleLogout = async () => {
    //     if (window.innerWidth <= 992) { // Close sidebar on mobile before logout
    //         toggleSidebar();
    //     }
    //     await logout();
    // };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && window.innerWidth <= 992 && <div className="sidebar-overlay" onClick={toggleSidebar}></div>} {/* Show overlay only on mobile when open */}

            <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <Link to={ROUTES.USER_DASHBOARD} className="sidebar-logo">
                        <span>{APP_NAME}</span>
                    </Link>
                    <button className="sidebar-close-mobile" onClick={toggleSidebar}>×</button>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        {navItems.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `sidebar-nav-link ${isActive ? 'active' : ''}`
                                    }
                                    onClick={handleNavLinkClick} 
                                >
                                    {item.icon && <span className="nav-icon">{item.icon}</span>}
                                    <span className="nav-text">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    {/* <button onClick={handleLogout} className="sidebar-nav-link logout-button">
                        <LogOut size={20} />
                        <span className="nav-text">Logout</span>
                    </button> */}
                    <LogoutButton />
                </div>
            </aside>
        </>
    );
};

Sidebar.propTypes = {
    navItems: PropTypes.arrayOf(
        PropTypes.shape({
            to: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            icon: PropTypes.node, // e.g., <IconComponent />
        })
    ).isRequired,
    isOpen: PropTypes.bool.isRequired,
    toggleSidebar: PropTypes.func.isRequired,
};

export default Sidebar;