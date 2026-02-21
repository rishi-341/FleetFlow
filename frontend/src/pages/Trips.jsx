import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { PageHeader, Table, Modal, FormGroup, Alert, StatusPill } from '../components/UI';

const TripForm = ({ onSave, onClose }) => {
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [form, setForm] = useState({
        vehicle: '', driver: '', origin: '', destination: '',
        cargoDescription: '', cargoWeight: '', revenue: '', startOdometer: '',
    });
    const [error, setError] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    useEffect(() => {
        const load = async () => {
            const [vRes, dRes] = await Promise.all([
                API.get('/vehicles?status=Available'),
                API.get('/drivers'),
            ]);
            setVehicles(vRes.data);
            const availableDrivers = dRes.data.filter((d) => d.status !== 'On Trip' && d.status !== 'Suspended');
            setDrivers(availableDrivers);
        };
        load();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        if (name === 'vehicle') {
            setSelectedVehicle(vehicles.find((v) => v._id === value) || null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await onSave(form);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating trip');
        }
    };

    const overCapacity = selectedVehicle && form.cargoWeight > selectedVehicle.maxCapacity;

    return (
        <form onSubmit={handleSubmit}>
            <Alert type="error" message={error} />
            {selectedVehicle && (
                <div className="capacity-indicator">
                    <span>Max capacity: <strong>{selectedVehicle.maxCapacity} kg</strong></span>
                    {form.cargoWeight && (
                        <span className={overCapacity ? 'text-danger' : 'text-success'}>
                            {overCapacity ? ' ⚠ Overloaded!' : ' ✓ OK'}
                        </span>
                    )}
                </div>
            )}
            <div className="form-grid">
                <FormGroup label="Vehicle (Available)">
                    <select name="vehicle" value={form.vehicle} onChange={handleChange} required>
                        <option value="">Select vehicle...</option>
                        {vehicles.map((v) => (
                            <option key={v._id} value={v._id}>
                                {v.name} ({v.licensePlate}) — {v.maxCapacity}kg
                            </option>
                        ))}
                    </select>
                </FormGroup>
                <FormGroup label="Driver">
                    <select name="driver" value={form.driver} onChange={handleChange} required>
                        <option value="">Select driver...</option>
                        {drivers.map((d) => {
                            const expired = new Date(d.licenseExpiry) < new Date();
                            return (
                                <option key={d._id} value={d._id} disabled={expired}>
                                    {d.name} {expired ? '(EXPIRED)' : `— ${d.licenseCategory?.join(', ')}`}
                                </option>
                            );
                        })}
                    </select>
                </FormGroup>
                <FormGroup label="Origin"><input name="origin" value={form.origin} onChange={handleChange} required placeholder="City / Warehouse" /></FormGroup>
                <FormGroup label="Destination"><input name="destination" value={form.destination} onChange={handleChange} required placeholder="City / Warehouse" /></FormGroup>
                <FormGroup label="Cargo Weight (kg)">
                    <input name="cargoWeight" type="number" value={form.cargoWeight} onChange={handleChange} required className={overCapacity ? 'input-error' : ''} />
                </FormGroup>
                <FormGroup label="Revenue (₹)"><input name="revenue" type="number" value={form.revenue} onChange={handleChange} /></FormGroup>
                <FormGroup label="Start Odometer (km)"><input name="startOdometer" type="number" value={form.startOdometer} onChange={handleChange} /></FormGroup>
            </div>
            <FormGroup label="Cargo Description"><textarea name="cargoDescription" value={form.cargoDescription} onChange={handleChange} rows={2} /></FormGroup>
            <div className="form-actions">
                <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={overCapacity}>Dispatch Trip</button>
            </div>
        </form>
    );
};

const CompleteForm = ({ trip, onSave, onClose }) => {
    const [form, setForm] = useState({ endOdometer: '', distanceKm: '', revenue: trip.revenue || '' });
    const [error, setError] = useState('');

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
            <div className="form-grid">
                <FormGroup label="End Odometer (km)"><input name="endOdometer" type="number" value={form.endOdometer} onChange={(e) => setForm({ ...form, endOdometer: e.target.value })} required /></FormGroup>
                <FormGroup label="Distance (km)"><input name="distanceKm" type="number" value={form.distanceKm} onChange={(e) => setForm({ ...form, distanceKm: e.target.value })} /></FormGroup>
                <FormGroup label="Revenue (₹)"><input name="revenue" type="number" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })} /></FormGroup>
            </div>
            <div className="form-actions">
                <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn-primary">Complete Trip</button>
            </div>
        </form>
    );
};

const Trips = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [showComplete, setShowComplete] = useState(null);
    const [filter, setFilter] = useState('');

    useEffect(() => { fetchTrips(); }, []);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/trips');
            setTrips(data);
        } catch {
            setError('Failed to load trips');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (form) => {
        await API.post('/trips', form);
        fetchTrips();
    };

    const handleStatus = async (trip, status, extra = {}) => {
        await API.patch(`/trips/${trip._id}/status`, { status, ...extra });
        fetchTrips();
    };

    const filtered = filter ? trips.filter((t) => t.status === filter) : trips;

    return (
        <div>
            <PageHeader title="Trip Dispatcher" subtitle="Create and manage delivery trips">
                <button className="btn-primary" onClick={() => setShowCreate(true)}>+ New Trip</button>
            </PageHeader>

            <Alert type="error" message={error} />

            <div className="filter-bar">
                {['', 'Draft', 'Dispatched', 'Completed', 'Cancelled'].map((s) => (
                    <button
                        key={s}
                        className={`filter-btn ${filter === s ? 'active' : ''}`}
                        onClick={() => setFilter(s)}
                    >
                        {s || 'All'}
                    </button>
                ))}
            </div>

            {loading ? <div className="loading-spinner">Loading...</div> : (
                <Table headers={['Trip #', 'Vehicle', 'Driver', 'Route', 'Cargo', 'Revenue', 'Status', 'Actions']}>
                    {filtered.map((t) => (
                        <tr key={t._id}>
                            <td><strong>{t.tripNumber}</strong></td>
                            <td>{t.vehicle?.name}<br /><small className="mono">{t.vehicle?.licensePlate}</small></td>
                            <td>{t.driver?.name}</td>
                            <td>{t.origin} → {t.destination}</td>
                            <td>{t.cargoWeight} kg</td>
                            <td>{t.revenue ? `₹${t.revenue.toLocaleString()}` : '—'}</td>
                            <td><StatusPill status={t.status} /></td>
                            <td>
                                <div className="action-buttons">
                                    {t.status === 'Draft' && (
                                        <>
                                            <button className="btn-sm btn-primary" onClick={() => handleStatus(t, 'Dispatched')}>Dispatch</button>
                                            <button className="btn-sm btn-outline" onClick={() => handleStatus(t, 'Cancelled')}>Cancel</button>
                                        </>
                                    )}
                                    {t.status === 'Dispatched' && (
                                        <>
                                            <button className="btn-sm btn-primary" onClick={() => setShowComplete(t)}>Complete</button>
                                            <button className="btn-sm btn-outline" onClick={() => handleStatus(t, 'Cancelled')}>Cancel</button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </Table>
            )}

            {showCreate && (
                <Modal title="Create New Trip" onClose={() => setShowCreate(false)}>
                    <TripForm onSave={handleCreate} onClose={() => setShowCreate(false)} />
                </Modal>
            )}

            {showComplete && (
                <Modal title={`Complete Trip ${showComplete.tripNumber}`} onClose={() => setShowComplete(null)}>
                    <CompleteForm
                        trip={showComplete}
                        onSave={(extra) => handleStatus(showComplete, 'Completed', extra)}
                        onClose={() => setShowComplete(null)}
                    />
                </Modal>
            )}
        </div>
    );
};

export default Trips;
