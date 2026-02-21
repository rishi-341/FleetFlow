import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { PageHeader, Table, Modal, FormGroup, Alert } from '../components/UI';

const FuelForm = ({ onSave, onClose }) => {
    const [vehicles, setVehicles] = useState([]);
    const [trips, setTrips] = useState([]);
    const [form, setForm] = useState({
        vehicle: '', trip: '', liters: '', costPerLiter: '',
        date: new Date().toISOString().split('T')[0], odometer: '', station: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([API.get('/vehicles'), API.get('/trips?status=Completed')]).then(([vRes, tRes]) => {
            setVehicles(vRes.data);
            setTrips(tRes.data);
        });
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await onSave({ ...form, trip: form.trip || undefined });
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Error');
        }
    };

    const totalCost = form.liters && form.costPerLiter
        ? (parseFloat(form.liters) * parseFloat(form.costPerLiter)).toFixed(2)
        : 0;

    return (
        <form onSubmit={handleSubmit}>
            <Alert type="error" message={error} />
            {totalCost > 0 && (
                <div className="info-banner">
                    Estimated Cost: <strong>₹{parseFloat(totalCost).toLocaleString()}</strong>
                </div>
            )}
            <div className="form-grid">
                <FormGroup label="Vehicle">
                    <select name="vehicle" value={form.vehicle} onChange={handleChange} required>
                        <option value="">Select vehicle...</option>
                        {vehicles.map((v) => (
                            <option key={v._id} value={v._id}>{v.name} ({v.licensePlate})</option>
                        ))}
                    </select>
                </FormGroup>
                <FormGroup label="Linked Trip (Optional)">
                    <select name="trip" value={form.trip} onChange={handleChange}>
                        <option value="">None</option>
                        {trips.map((t) => (
                            <option key={t._id} value={t._id}>{t.tripNumber} — {t.origin} → {t.destination}</option>
                        ))}
                    </select>
                </FormGroup>
                <FormGroup label="Liters"><input name="liters" type="number" step="0.01" value={form.liters} onChange={handleChange} required /></FormGroup>
                <FormGroup label="Cost per Liter (₹)"><input name="costPerLiter" type="number" step="0.01" value={form.costPerLiter} onChange={handleChange} required /></FormGroup>
                <FormGroup label="Date"><input name="date" type="date" value={form.date} onChange={handleChange} required /></FormGroup>
                <FormGroup label="Odometer (km)"><input name="odometer" type="number" value={form.odometer} onChange={handleChange} /></FormGroup>
                <FormGroup label="Fuel Station"><input name="station" value={form.station} onChange={handleChange} placeholder="Station name" /></FormGroup>
            </div>
            <div className="form-actions">
                <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn-primary">Log Fuel</button>
            </div>
        </form>
    );
};

const Fuel = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { fetchLogs(); }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/fuel');
            setLogs(data);
        } catch {
            setError('Failed to load fuel logs');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (form) => {
        await API.post('/fuel', form);
        fetchLogs();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this log?')) return;
        await API.delete(`/fuel/${id}`);
        fetchLogs();
    };

    const totalCost = logs.reduce((s, l) => s + (l.totalCost || 0), 0);
    const totalLiters = logs.reduce((s, l) => s + (l.liters || 0), 0);

    return (
        <div>
            <PageHeader title="Fuel & Expense Logs" subtitle="Track fuel costs per vehicle">
                <button className="btn-primary" onClick={() => setShowModal(true)}>+ Log Fuel</button>
            </PageHeader>

            <Alert type="error" message={error} />

            <div className="kpi-grid kpi-grid-sm">
                <div className="kpi-card">
                    <div className="kpi-icon">⛽</div>
                    <div className="kpi-body">
                        <div className="kpi-value">₹{Math.round(totalCost).toLocaleString()}</div>
                        <div className="kpi-label">Total Fuel Cost</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon">🪣</div>
                    <div className="kpi-body">
                        <div className="kpi-value">{totalLiters.toFixed(1)} L</div>
                        <div className="kpi-label">Total Liters</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon">📋</div>
                    <div className="kpi-body">
                        <div className="kpi-value">{logs.length}</div>
                        <div className="kpi-label">Total Records</div>
                    </div>
                </div>
            </div>

            {loading ? <div className="loading-spinner">Loading...</div> : (
                <Table headers={['Vehicle', 'Trip', 'Liters', 'Rate/L', 'Total Cost', 'Date', 'Station', 'Actions']}>
                    {logs.map((l) => (
                        <tr key={l._id}>
                            <td><strong>{l.vehicle?.name}</strong><br /><small className="mono">{l.vehicle?.licensePlate}</small></td>
                            <td>{l.trip?.tripNumber || '—'}</td>
                            <td>{l.liters} L</td>
                            <td>₹{l.costPerLiter}/L</td>
                            <td><strong>₹{l.totalCost?.toLocaleString()}</strong></td>
                            <td>{new Date(l.date).toLocaleDateString()}</td>
                            <td>{l.station || '—'}</td>
                            <td>
                                <button className="btn-icon btn-danger" onClick={() => handleDelete(l._id)}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </Table>
            )}

            {showModal && (
                <Modal title="Log Fuel Entry" onClose={() => setShowModal(false)}>
                    <FuelForm onSave={handleCreate} onClose={() => setShowModal(false)} />
                </Modal>
            )}
        </div>
    );
};

export default Fuel;
