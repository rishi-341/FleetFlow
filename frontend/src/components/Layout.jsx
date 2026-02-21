import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { path: '/dashboard', label: 'Command Center', icon: '⬛' },
    { path: '/vehicles', label: 'Vehicle Registry', icon: '🚛' },
    { path: '/trips', label: 'Trip Dispatcher', icon: '📍' },
    { path: '/maintenance', label: 'Maintenance Logs', icon: '🔧' },
    { path: '/fuel', label: 'Fuel & Expenses', icon: '⛽' },
    { path: '/drivers', label: 'Driver Profiles', icon: '👤' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
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
                                <span className="brand-icon">▣</span>
                                <span className="brand-name">FleetFlow</span>
                            </>
                        )}
                    </div>
                    <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? '◀' : '▶'}
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
                            <span className="nav-icon">{icon}</span>
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
                        ⏻
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
