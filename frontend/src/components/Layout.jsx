import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { path: '/dashboard', label: 'Command Center', icon: 'fa-solid fa-gauge-high' },
    { path: '/vehicles', label: 'Vehicle Registry', icon: 'fa-solid fa-truck' },
    { path: '/trips', label: 'Trip Dispatcher', icon: 'fa-solid fa-route' },
    { path: '/maintenance', label: 'Maintenance Logs', icon: 'fa-solid fa-screwdriver-wrench' },
    { path: '/fuel', label: 'Fuel & Expenses', icon: 'fa-solid fa-gas-pump' },
    { path: '/drivers', label: 'Driver Profiles', icon: 'fa-solid fa-id-card' },
    { path: '/analytics', label: 'Analytics', icon: 'fa-solid fa-chart-bar' },
];

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
                <div className="sidebar-header">
                    <div className="brand">
                        {sidebarOpen && (
                            <>
                                <img src="/favicon.svg" alt="FleetFlow" className="sidebar-logo-img" />
                                <span className="brand-name">FleetFlow</span>
                            </>
                        )}
                        {!sidebarOpen && (
                            <img src="/favicon.svg" alt="FleetFlow" className="sidebar-logo-img" />
                        )}
                    </div>
                    <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <i className={`fa-solid ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(({ path, label, icon }) => (
                        <Link
                            key={path}
                            to={path}
                            className={`nav-item ${location.pathname === path ? 'active' : ''}`}
                            title={!sidebarOpen ? label : ''}
                        >
                            <i className={`${icon} nav-icon`}></i>
                            {sidebarOpen && <span className="nav-label">{label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {sidebarOpen && (
                        <div className="user-info">
                            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                            <div className="user-details">
                                <div className="user-name">{user?.name}</div>
                                <div className="user-role">{user?.role?.replace('_', ' ')}</div>
                            </div>
                        </div>
                    )}
                    <button className="logout-btn" onClick={handleLogout} title="Logout">
                        <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <div className="content-wrapper">{children}</div>
            </main>
        </div>
    );
};

export default Layout;
