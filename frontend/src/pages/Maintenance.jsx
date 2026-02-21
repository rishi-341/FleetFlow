import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { PageHeader, Table, Modal, FormGroup, Alert, StatusPill } from '../components/UI';

const MaintenanceForm = ({ onSave, onClose }) => {
    const [vehicles, setVehicles] = useState([]);
    const [form, setForm] = useState({
        vehicle: '', serviceType: 'Oil Change', description: '',
        cost: '', serviceDate: new Date().toISOString().split('T')[0],
        vendor: '', odometer: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        API.get('/vehicles').then(({ data }) => setVehicles(data));
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await onSave(form);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Error');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Alert type="error" message={error} />
            <div className="info-banner">
                ⚠️ Adding a maintenance log will automatically set the vehicle status to <strong>In Shop</strong>
            </div>
            <div className="form-grid">
                <FormGroup label="Vehicle">
                    <select name="vehicle" value={form.vehicle} onChange={handleChange} required>
                        <option value="">Select vehicle...</option>
                        {vehicles.map((v) => (
                            <option key={v._id} value={v._id}>{v.name} ({v.licensePlate})</option>
                        ))}
                    </select>
                </FormGroup>
                <FormGroup label="Service Type">
                    <select name="serviceType" value={form.serviceType} onChange={handleChange}>
                        <option>Oil Change</option><option>Tire Replacement</option><option>Brake Service</option>
                        <option>Engine Repair</option><option>Transmission</option><option>Electrical</option>
                        <option>Body Work</option><option>Other</option>
                    </select>
                </FormGroup>
                <FormGroup label="Cost (₹)"><input name="cost" type="number" value={form.cost} onChange={handleChange} required /></FormGroup>
                <FormGroup label="Service Date"><input name="serviceDate" type="date" value={form.serviceDate} onChange={handleChange} required /></FormGroup>
                <FormGroup label="Vendor / Workshop"><input name="vendor" value={form.vendor} onChange={handleChange} /></FormGroup>
                <FormGroup label="Odometer (km)"><input name="odometer" type="number" value={form.odometer} onChange={handleChange} /></FormGroup>
            </div>
            <FormGroup label="Description"><textarea name="description" value={form.description} onChange={handleChange} rows={2} /></FormGroup>
            <div className="form-actions">
                <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn-primary">Log Service</button>
            </div>
        </form>
    );
};

const Maintenance = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { fetchLogs(); }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/maintenance');
            setLogs(data);
        } catch {
            setError('Failed to load maintenance logs');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (form) => {
        await API.post('/maintenance', form);
        fetchLogs();
    };

    const handleComplete = async (log) => {
        await API.put(`/maintenance/${log._id}`, {
            status: 'Completed',
            completedDate: new Date().toISOString(),
        });
        fetchLogs();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this log?')) return;
        await API.delete(`/maintenance/${id}`);
        fetchLogs();
    };

    return (
        <div>
            <PageHeader title="Maintenance & Service Logs" subtitle="Track vehicle health and repair history">
                <button className="btn-primary" onClick={() => setShowModal(true)}>+ Log Service</button>
            </PageHeader>

            <Alert type="error" message={error} />

            {loading ? <div className="loading-spinner">Loading...</div> : (
                <Table headers={['Vehicle', 'Service Type', 'Cost', 'Date', 'Vendor', 'Status', 'Actions']}>
                    {logs.map((l) => (
                        <tr key={l._id}>
                            <td><strong>{l.vehicle?.name}</strong><br /><small className="mono">{l.vehicle?.licensePlate}</small></td>
                            <td>{l.serviceType}</td>
                            <td>₹{l.cost?.toLocaleString()}</td>
                            <td>{new Date(l.serviceDate).toLocaleDateString()}</td>
                            <td>{l.vendor || '—'}</td>
                            <td><StatusPill status={l.status} /></td>
                            <td>
                                <div className="action-buttons">
                                    {l.status === 'Ongoing' && (
                                        <button className="btn-sm btn-primary" onClick={() => handleComplete(l)}>Mark Done</button>
                                    )}
                                    <button className="btn-icon btn-danger" onClick={() => handleDelete(l._id)}>🗑️</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </Table>
            )}

            {showModal && (
                <Modal title="Log Maintenance Service" onClose={() => setShowModal(false)}>
                    <MaintenanceForm onSave={handleCreate} onClose={() => setShowModal(false)} />
                </Modal>
            )}
        </div>
    );
};

export default Maintenance;
