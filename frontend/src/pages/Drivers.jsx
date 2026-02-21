import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { PageHeader, Table, Modal, FormGroup, Alert, StatusPill } from '../components/UI';

const DriverForm = ({ initial, onSave, onClose }) => {
    const [form, setForm] = useState(initial || {
        name: '', email: '', phone: '', licenseNumber: '',
        licenseCategory: ['Van'], licenseExpiry: '', region: 'Central', notes: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        setForm({
            ...form,
            licenseCategory: checked
                ? [...form.licenseCategory, value]
                : form.licenseCategory.filter((c) => c !== value),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await onSave(form);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving driver');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Alert type="error" message={error} />
            <div className="form-grid">
                <FormGroup label="Full Name"><input name="name" value={form.name} onChange={handleChange} required /></FormGroup>
                <FormGroup label="Email"><input name="email" type="email" value={form.email} onChange={handleChange} /></FormGroup>
                <FormGroup label="Phone"><input name="phone" value={form.phone} onChange={handleChange} /></FormGroup>
                <FormGroup label="License Number"><input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} required /></FormGroup>
                <FormGroup label="License Expiry">
                    <input name="licenseExpiry" type="date" value={form.licenseExpiry?.split('T')[0] || ''} onChange={handleChange} required />
                </FormGroup>
                <FormGroup label="Region"><input name="region" value={form.region} onChange={handleChange} /></FormGroup>
            </div>
            <FormGroup label="License Categories">
                <div className="checkbox-group">
                    {['Truck', 'Van', 'Bike'].map((cat) => (
                        <label key={cat} className="checkbox-label">
                            <input
                                type="checkbox"
                                value={cat}
                                checked={form.licenseCategory?.includes(cat)}
                                onChange={handleCategoryChange}
                            />
                            {cat}
                        </label>
                    ))}
                </div>
            </FormGroup>
            <FormGroup label="Notes"><textarea name="notes" value={form.notes} onChange={handleChange} rows={2} /></FormGroup>
            <div className="form-actions">
                <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn-primary">Save Driver</button>
            </div>
        </form>
    );
};

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);

    useEffect(() => { fetchDrivers(); }, []);

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/drivers');
            setDrivers(data);
        } catch {
            setError('Failed to load drivers');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (form) => {
        if (editing) {
            await API.put(`/drivers/${editing._id}`, form);
        } else {
            await API.post('/drivers', form);
        }
        fetchDrivers();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this driver?')) return;
        await API.delete(`/drivers/${id}`);
        fetchDrivers();
    };

    const handleStatusChange = async (id, status) => {
        await API.patch(`/drivers/${id}/status`, { status });
        fetchDrivers();
    };

    const isExpired = (expiry) => new Date(expiry) < new Date();

    const completionRate = (d) =>
        d.totalTrips > 0 ? Math.round((d.completedTrips / d.totalTrips) * 100) : 0;

    return (
        <div>
            <PageHeader title="Driver Profiles" subtitle="Human resources & compliance management">
                <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
                    + Add Driver
                </button>
            </PageHeader>

            <Alert type="error" message={error} />

            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : (
                <Table headers={['Name', 'License', 'Categories', 'Expiry', 'Status', 'Safety', 'Trips', 'Actions']}>
                    {drivers.map((d) => {
                        const expired = isExpired(d.licenseExpiry);
                        return (
                            <tr key={d._id} className={expired ? 'row-warning' : ''}>
                                <td>
                                    <strong>{d.name}</strong>
                                    {expired && <span className="badge-danger">LICENSE EXPIRED</span>}
                                </td>
                                <td className="mono">{d.licenseNumber}</td>
                                <td>{d.licenseCategory?.join(', ')}</td>
                                <td className={expired ? 'text-danger' : ''}>
                                    {new Date(d.licenseExpiry).toLocaleDateString()}
                                </td>
                                <td><StatusPill status={d.status} /></td>
                                <td>
                                    <div className="score-bar">
                                        <div className="score-fill" style={{ width: `${d.safetyScore}%` }} />
                                        <span>{d.safetyScore}/100</span>
                                    </div>
                                </td>
                                <td>{d.completedTrips}/{d.totalTrips} ({completionRate(d)}%)</td>
                                <td>
                                    <div className="action-buttons">
                                        <select
                                            className="status-select"
                                            value={d.status}
                                            onChange={(e) => handleStatusChange(d._id, e.target.value)}
                                        >
                                            <option>On Duty</option>
                                            <option>Off Duty</option>
                                            <option>Suspended</option>
                                        </select>
                                        <button className="btn-icon" onClick={() => { setEditing(d); setShowModal(true); }}>✏️</button>
                                        <button className="btn-icon btn-danger" onClick={() => handleDelete(d._id)}>🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </Table>
            )}

            {showModal && (
                <Modal title={editing ? 'Edit Driver' : 'Add Driver'} onClose={() => setShowModal(false)}>
                    <DriverForm initial={editing} onSave={handleSave} onClose={() => setShowModal(false)} />
                </Modal>
            )}
        </div>
    );
};

export default Drivers;
