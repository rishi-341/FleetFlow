import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/UI';

const Login = () => {
    const [mode, setMode] = useState('login');

    // Login form state
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });

    // Register form state
    const [regForm, setRegForm] = useState({
        name: '',
        username: '',
        email: '',
        contact: '',
        password: '',
        confirmPassword: '',
        role: 'dispatcher',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleLoginChange = (e) =>
        setLoginForm({ ...loginForm, [e.target.name]: e.target.value });

    const handleRegChange = (e) =>
        setRegForm({ ...regForm, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate confirm password on register
        if (mode === 'register' && regForm.password !== regForm.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            if (mode === 'login') {
                await login(loginForm.username, loginForm.password);
            } else {
                await register(
                    regForm.name,
                    regForm.username,
                    regForm.email,
                    regForm.contact,
                    regForm.password,
                    regForm.role
                );
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setError('');
        setMode(mode === 'login' ? 'register' : 'login');
    };

    return (
        <div className="login-page">
            {/* Left Panel */}
            <div className="login-left">
                <div className="login-brand">
                    <i className="fa-solid fa-hexagon-nodes login-brand-icon"></i>
                    <h1>FleetFlow</h1>
                </div>
                <p className="login-tagline">
                    Modular Fleet &amp; Logistics<br />Management System
                </p>
                <div className="login-stats">
                    <div className="login-stat">
                        <i className="fa-solid fa-truck-moving"></i>
                        <span>Real-time</span>
                        Fleet Tracking
                    </div>
                    <div className="login-stat">
                        <i className="fa-solid fa-route"></i>
                        <span>Smart</span>
                        Dispatching
                    </div>
                    <div className="login-stat">
                        <i className="fa-solid fa-chart-bar"></i>
                        <span>AI-ready</span>
                        Analytics
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="login-right">
                <div className="login-card">
                    <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
                    <p className="login-card-sub">
                        {mode === 'login'
                            ? 'Enter your username and password'
                            : 'Fill in the details to join FleetFlow'}
                    </p>

                    <Alert type="error" message={error} />

                    <form onSubmit={handleSubmit} className="login-form">

                        {/* ─── REGISTER FIELDS ─── */}
                        {mode === 'register' && (
                            <>
                                <div className="form-group">
                                    <label>
                                        <i className="fa-solid fa-user form-icon"></i> Full Name
                                    </label>
                                    <input
                                        name="name"
                                        type="text"
                                        placeholder="John Smith"
                                        value={regForm.name}
                                        onChange={handleRegChange}
                                        required
                                    />
                                </div>

                                <div className="login-form-row">
                                    <div className="form-group">
                                        <label>
                                            <i className="fa-solid fa-at form-icon"></i> Username
                                        </label>
                                        <input
                                            name="username"
                                            type="text"
                                            placeholder="johnsmith99"
                                            value={regForm.username}
                                            onChange={handleRegChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="fa-solid fa-phone form-icon"></i> Contact
                                        </label>
                                        <input
                                            name="contact"
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                            value={regForm.contact}
                                            onChange={handleRegChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>
                                        <i className="fa-solid fa-envelope form-icon"></i> Email Address
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="john@fleetflow.com"
                                        value={regForm.email}
                                        onChange={handleRegChange}
                                        required
                                    />
                                </div>

                                <div className="login-form-row">
                                    <div className="form-group">
                                        <label>
                                            <i className="fa-solid fa-lock form-icon"></i> Password
                                        </label>
                                        <input
                                            name="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={regForm.password}
                                            onChange={handleRegChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <i className="fa-solid fa-lock form-icon"></i> Confirm Password
                                        </label>
                                        <input
                                            name="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            value={regForm.confirmPassword}
                                            onChange={handleRegChange}
                                            required
                                            className={
                                                regForm.confirmPassword && regForm.password !== regForm.confirmPassword
                                                    ? 'input-error'
                                                    : ''
                                            }
                                        />
                                        {regForm.confirmPassword && regForm.password !== regForm.confirmPassword && (
                                            <span className="form-error">Passwords do not match</span>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>
                                        <i className="fa-solid fa-user-shield form-icon"></i> Role
                                    </label>
                                    <select name="role" value={regForm.role} onChange={handleRegChange}>
                                        <option value="manager">Fleet Manager</option>
                                        <option value="dispatcher">Dispatcher</option>
                                        <option value="safety_officer">Safety Officer</option>
                                        <option value="financial_analyst">Financial Analyst</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* ─── LOGIN FIELDS ─── */}
                        {mode === 'login' && (
                            <>
                                <div className="form-group">
                                    <label>
                                        <i className="fa-solid fa-at form-icon"></i> Username
                                    </label>
                                    <input
                                        name="username"
                                        type="text"
                                        placeholder="Enter your username"
                                        value={loginForm.username}
                                        onChange={handleLoginChange}
                                        required
                                        autoComplete="username"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        <i className="fa-solid fa-lock form-icon"></i> Password
                                    </label>
                                    <input
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={loginForm.password}
                                        onChange={handleLoginChange}
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            className="btn-primary btn-full"
                            disabled={
                                loading ||
                                (mode === 'register' &&
                                    regForm.confirmPassword &&
                                    regForm.password !== regForm.confirmPassword)
                            }
                        >
                            {loading ? (
                                <><i className="fa-solid fa-spinner fa-spin"></i> Please wait...</>
                            ) : mode === 'login' ? (
                                <><i className="fa-solid fa-arrow-right-to-bracket"></i> Sign In</>
                            ) : (
                                <><i className="fa-solid fa-user-plus"></i> Create Account</>
                            )}
                        </button>
                    </form>

                    <div className="login-divider" />
                    <p className="login-switch">
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button className="link-btn" onClick={switchMode}>
                            {mode === 'login' ? 'Register' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
