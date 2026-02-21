import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { PageHeader, Table, Modal, FormGroup, Alert, StatusPill } from '../components/UI';

const VehicleForm = ({ initial, onSave, onClose }) => {
    const [form, setForm] = useState(initial || {
        name: '', model: '', licensePlate: '', type: 'Van',
        maxCapacity: '', odometer: '', region: 'Central',
        acquisitionCost: '', year: '', notes: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await onSave(form);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving vehicle');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Alert type="error" message={error} />
            <div className="form-grid">
                <FormGroup label="Vehicle Name"><input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Van-05" /></FormGroup>
                <FormGroup label="Model"><input name="model" value={form.model} onChange={handleChange} required placeholder="e.g. Tata Ace" /></FormGroup>
                <FormGroup label="License Plate"><input name="licensePlate" value={form.licensePlate} onChange={handleChange} required placeholder="MH01AB1234" /></FormGroup>
                <FormGroup label="Type">
                    <select name="type" value={form.type} onChange={handleChange}>
                        <option>Truck</option><option>Van</option><option>Bike</option>
                    </select>
                </FormGroup>
                <FormGroup label="Max Capacity (kg)"><input name="maxCapacity" type="number" value={form.maxCapacity} onChange={handleChange} required /></FormGroup>
                <FormGroup label="Odometer (km)"><input name="odometer" type="number" value={form.odometer} onChange={handleChange} /></FormGroup>
                <FormGroup label="Year"><input name="year" type="number" value={form.year} onChange={handleChange} /></FormGroup>
                <FormGroup label="Region"><input name="region" value={form.region} onChange={handleChange} /></FormGroup>
                <FormGroup label="Acquisition Cost (₹)"><input name="acquisitionCost" type="number" value={form.acquisitionCost} onChange={handleChange} /></FormGroup>
            </div>
            <FormGroup label="Notes"><textarea name="notes" value={form.notes} onChange={handleChange} rows={2} /></FormGroup>
            <div className="form-actions">
                <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn-primary">Save Vehicle</button>
            </div>
        </form>
    );
};

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [filter, setFilter] = useState({ type: '', status: '' });

    useEffect(() => { fetchVehicles(); }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/vehicles');
            setVehicles(data);
        } catch {
            setError('Failed to load vehicles');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (form) => {
        if (editing) {
            await API.put(`/vehicles/${editing._id}`, form);
        } else {
            await API.post('/vehicles', form);
        }
        fetchVehicles();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this vehicle?')) return;
        await API.delete(`/vehicles/${id}`);
        fetchVehicles();
    };

    const handleToggleService = async (id) => {
        await API.patch(`/vehicles/${id}/toggle-service`);
        fetchVehicles();
    };

    const filtered = vehicles.filter((v) => {
        if (filter.type && v.type !== filter.type) return false;
        if (filter.status && v.status !== filter.status) return false;
        return true;
    });

    return (
        <div>
            <PageHeader title="Vehicle Registry" subtitle="Manage your fleet assets">
                <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
                    + Add Vehicle
                </button>
            </PageHeader>

            <Alert type="error" message={error} />

            <div className="filter-bar">
                <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
                    <option value="">All Types</option>
                    <option>Truck</option><option>Van</option><option>Bike</option>
                </select>
                <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
                    <option value="">All Statuses</option>
                    <option>Available</option><option>On Trip</option>
                    <option>In Shop</option><option>Out of Service</option>
                </select>
                <button className="btn-outline" onClick={() => setFilter({ type: '', status: '' })}>Clear</button>
                <span className="filter-count">{filtered.length} vehicles</span>
            </div>

            {loading ? (
                <div className="loading-spinner">Loading...</div>
            ) : (
                <Table headers={['Name', 'Plate', 'Type', 'Capacity', 'Odometer', 'Status', 'Actions']}>
                    {filtered.map((v) => (
                        <tr key={v._id}>
                            <td><strong>{v.name}</strong><br /><small>{v.model}</small></td>
                            <td className="mono">{v.licensePlate}</td>
                            <td>{v.type}</td>
                            <td>{v.maxCapacity} kg</td>
                            <td>{v.odometer?.toLocaleString()} km</td>
                            <td><StatusPill status={v.status} /></td>
                            <td>
                                <div className="action-buttons">
                                    <button className="btn-icon" onClick={() => { setEditing(v); setShowModal(true); }}>✏️</button>
                                    <button className="btn-icon" onClick={() => handleToggleService(v._id)}>
                                        {v.status === 'Out of Service' ? '♻️' : '🚫'}
                                    </button>
                                    <button className="btn-icon btn-danger" onClick={() => handleDelete(v._id)}>🗑️</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </Table>
            )}

            {showModal && (
                <Modal title={editing ? 'Edit Vehicle' : 'Add Vehicle'} onClose={() => setShowModal(false)}>
                    <VehicleForm initial={editing} onSave={handleSave} onClose={() => setShowModal(false)} />
                </Modal>
            )}
        </div>
    );
};

export default Vehicles;
