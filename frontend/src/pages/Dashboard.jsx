import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { Alert } from '../components/UI';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState({ type: '', status: '', region: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [vRes, tRes] = await Promise.all([
                API.get('/vehicles'),
                API.get('/trips'),
            ]);
            setVehicles(vRes.data);
            setTrips(tRes.data);
        } catch (err) {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const filteredVehicles = vehicles.filter((v) => {
        if (filter.type && v.type !== filter.type) return false;
        if (filter.status && v.status !== filter.status) return false;
        if (filter.region && v.region !== filter.region) return false;
        return true;
    });

    const recentTrips = trips.slice(0, 5);

    const statusClass = (s) => {
        const m = {
            Available: 'pill-available',
            'On Trip': 'pill-on-trip',
            'In Shop': 'pill-in-shop',
            'Out of Service': 'pill-retired',
        };
        return m[s] || 'pill-default';
    };

    if (loading) return <div className="loading-spinner"><i className="fa-solid fa-spinner fa-spin"></i> Loading...</div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Command Center</h1>
                    <p className="page-subtitle">
                        Welcome back, {user?.name} &middot;{' '}
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            <Alert type="error" message={error} />

            {/* Filters */}
            <div className="filter-bar">
                <span className="filter-label"><i className="fa-solid fa-filter"></i> Filter:</span>
                <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
                    <option value="">All Types</option>
                    <option>Truck</option>
                    <option>Van</option>
                    <option>Bike</option>
                </select>
                <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
                    <option value="">All Statuses</option>
                    <option>Available</option>
                    <option>On Trip</option>
                    <option>In Shop</option>
                    <option>Out of Service</option>
                </select>
                <button className="btn-outline" onClick={() => setFilter({ type: '', status: '', region: '' })}>
                    <i className="fa-solid fa-xmark"></i> Clear
                </button>
            </div>

            {/* Vehicle Grid */}
            <div className="section-header">
                <h2>Fleet Overview</h2>
                <span className="badge">{filteredVehicles.length} vehicles</span>
            </div>
            <div className="vehicle-grid">
                {filteredVehicles.length === 0 ? (
                    <p className="empty-state">No vehicles match the selected filters.</p>
                ) : (
                    filteredVehicles.map((v) => (
                        <div key={v._id} className="vehicle-card">
                            <div className="vehicle-card-header">
                                <span className="vehicle-type-badge">{v.type}</span>
                                <span className={`status-pill ${statusClass(v.status)}`}>{v.status}</span>
                            </div>
                            <h3>{v.name}</h3>
                            <p className="vehicle-plate">{v.licensePlate}</p>
                            <div className="vehicle-meta">
                                <span><i className="fa-solid fa-weight-hanging"></i> {v.maxCapacity} kg</span>
                                <span><i className="fa-solid fa-road"></i> {v.odometer?.toLocaleString()} km</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Recent Trips */}
            <div className="section-header" style={{ marginTop: '2rem' }}>
                <h2>Recent Trips</h2>
            </div>
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Trip #</th>
                            <th>Vehicle</th>
                            <th>Driver</th>
                            <th>Route</th>
                            <th>Cargo</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentTrips.length === 0 ? (
                            <tr><td colSpan="6" className="empty-cell">No trips yet</td></tr>
                        ) : (
                            recentTrips.map((t) => (
                                <tr key={t._id}>
                                    <td><strong>{t.tripNumber}</strong></td>
                                    <td>{t.vehicle?.name || '—'}</td>
                                    <td>{t.driver?.name || '—'}</td>
                                    <td>
                                        <i className="fa-solid fa-location-dot"></i> {t.origin}{' '}
                                        <i className="fa-solid fa-arrow-right" style={{ margin: '0 4px', fontSize: '0.7rem' }}></i>{' '}
                                        {t.destination}
                                    </td>
                                    <td>{t.cargoWeight} kg</td>
                                    <td><span className={`status-pill ${statusClass(t.status)}`}>{t.status}</span></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
