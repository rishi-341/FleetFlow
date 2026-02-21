import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { PageHeader, Alert } from '../components/UI';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';

const COLORS = ['#000', '#333', '#555', '#777', '#999', '#bbb'];

const Analytics = () => {
    const [dashboard, setDashboard] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [d, v] = await Promise.all([
                API.get('/analytics/dashboard'),
                API.get('/analytics/vehicles'),
            ]);
            setDashboard(d.data);
            setVehicles(v.data);
        } catch {
            setError('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = () => {
        if (!vehicles.length) return;
        const headers = ['Vehicle', 'Plate', 'Type', 'Status', 'Fuel Cost', 'Maint Cost', 'Total Cost', 'Revenue', 'Distance (km)', 'Fuel Efficiency (km/L)', 'Cost/km', 'ROI (%)'];
        const rows = vehicles.map((v) => [
            v.name, v.licensePlate, v.type, v.status,
            v.totalFuelCost, v.totalMaintCost, v.totalCost,
            v.totalRevenue, v.totalDistance, v.fuelEfficiency, v.costPerKm, v.roi,
        ]);
        const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fleetflow_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const costData = vehicles.map((v) => ({
        name: v.name,
        Fuel: v.totalFuelCost,
        Maintenance: v.totalMaintCost,
    }));

    const efficiencyData = vehicles
        .filter((v) => parseFloat(v.fuelEfficiency) > 0)
        .map((v) => ({ name: v.name, 'km/L': parseFloat(v.fuelEfficiency) }));

    const fleetStatusData = dashboard ? [
        { name: 'Active', value: dashboard.activeFleet },
        { name: 'Available', value: dashboard.availableVehicles },
        { name: 'In Shop', value: dashboard.maintenanceAlerts },
        { name: 'Other', value: Math.max(0, dashboard.totalVehicles - dashboard.activeFleet - dashboard.availableVehicles - dashboard.maintenanceAlerts) },
    ].filter((d) => d.value > 0) : [];

    if (loading) return <div className="loading-spinner">Loading...</div>;

    return (
        <div>
            <PageHeader title="Analytics & Reports" subtitle="Data-driven fleet performance insights">
                <button className="btn-primary" onClick={exportCSV}>
                    <i className="fa-solid fa-download"></i> Export CSV
                </button>
            </PageHeader>

            <Alert type="error" message={error} />

            {/* Summary KPIs */}
            {dashboard && (
                <div className="kpi-grid">
                    <div className="kpi-card"><div className="kpi-icon"><i className="fa-solid fa-gas-pump"></i></div><div className="kpi-body"><div className="kpi-value">₹{dashboard.totalFuelCost?.toLocaleString()}</div><div className="kpi-label">Total Fuel Cost</div></div></div>
                    <div className="kpi-card"><div className="kpi-icon"><i className="fa-solid fa-screwdriver-wrench"></i></div><div className="kpi-body"><div className="kpi-value">₹{dashboard.totalMaintCost?.toLocaleString()}</div><div className="kpi-label">Total Maint. Cost</div></div></div>
                    <div className="kpi-card"><div className="kpi-icon"><i className="fa-solid fa-circle-check"></i></div><div className="kpi-body"><div className="kpi-value">{dashboard.completedTrips}</div><div className="kpi-label">Completed Trips</div></div></div>
                    <div className="kpi-card"><div className="kpi-icon"><i className="fa-solid fa-chart-line"></i></div><div className="kpi-body"><div className="kpi-value">{dashboard.utilizationRate}%</div><div className="kpi-label">Utilization Rate</div></div></div>
                </div>
            )}

            {/* Charts Row */}
            <div className="charts-grid">
                {/* Cost Breakdown per Vehicle */}
                <div className="chart-card">
                    <h3>Cost Breakdown by Vehicle</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={costData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="Fuel" fill="#000" />
                            <Bar dataKey="Maintenance" fill="#888" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Fleet Status Pie */}
                <div className="chart-card">
                    <h3>Fleet Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={fleetStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                                {fleetStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Fuel Efficiency */}
                <div className="chart-card chart-wide">
                    <h3>Fuel Efficiency (km/L) by Vehicle</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={efficiencyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="km/L" fill="#333" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Per Vehicle Table */}
            <div className="section-header" style={{ marginTop: '2rem' }}>
                <h2>Vehicle Financial Report</h2>
            </div>
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Vehicle</th><th>Type</th><th>Fuel Cost</th><th>Maint. Cost</th>
                            <th>Total Cost</th><th>Revenue</th><th>Dist. (km)</th>
                            <th>Efficiency</th><th>Cost/km</th><th>ROI</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.map((v) => (
                            <tr key={v._id}>
                                <td><strong>{v.name}</strong><br /><small className="mono">{v.licensePlate}</small></td>
                                <td>{v.type}</td>
                                <td>₹{v.totalFuelCost?.toLocaleString()}</td>
                                <td>₹{v.totalMaintCost?.toLocaleString()}</td>
                                <td><strong>₹{v.totalCost?.toLocaleString()}</strong></td>
                                <td>₹{v.totalRevenue?.toLocaleString()}</td>
                                <td>{v.totalDistance}</td>
                                <td>{v.fuelEfficiency} km/L</td>
                                <td>₹{v.costPerKm}/km</td>
                                <td className={parseFloat(v.roi) >= 0 ? 'text-success' : 'text-danger'}>
                                    {v.roi}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Analytics;
