import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/UI';

const Login = () => {
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'dispatcher' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'login') {
                await login(form.email, form.password);
            } else {
                await register(form.name, form.email, form.password, form.role);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-brand">
                    <span className="login-brand-icon">▣</span>
                    <h1>FleetFlow</h1>
                </div>
                <p className="login-tagline">
                    Modular Fleet & Logistics<br />Management System
                </p>
                <div className="login-stats">
                    <div className="login-stat"><span>Real-time</span><br />Fleet Tracking</div>
                    <div className="login-stat"><span>Smart</span><br />Dispatching</div>
                    <div className="login-stat"><span>AI-ready</span><br />Analytics</div>
                </div>
            </div>

            <div className="login-right">
                <div className="login-card">
                    <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
                    <p className="login-card-sub">
                        {mode === 'login' ? 'Access your fleet dashboard' : 'Join FleetFlow today'}
                    </p>

                    <Alert type="error" message={error} />

                    <form onSubmit={handleSubmit} className="login-form">
                        {mode === 'register' && (
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    placeholder="John Smith"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="you@fleetflow.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {mode === 'register' && (
                            <div className="form-group">
                                <label>Role</label>
                                <select name="role" value={form.role} onChange={handleChange}>
                                    <option value="manager">Fleet Manager</option>
                                    <option value="dispatcher">Dispatcher</option>
                                    <option value="safety_officer">Safety Officer</option>
                                    <option value="financial_analyst">Financial Analyst</option>
                                </select>
                            </div>
                        )}
                        <button type="submit" className="btn-primary btn-full" disabled={loading}>
                            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <div className="login-divider" />
                    <p className="login-switch">
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button className="link-btn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
                            {mode === 'login' ? 'Register' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
