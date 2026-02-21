const express = require('express');
const router = express.Router();
const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');
const { protect } = require('../middleware/auth');

// GET all maintenance logs
router.get('/', protect, async (req, res) => {
    try {
        const { vehicle, status } = req.query;
        const filter = {};
        if (vehicle) filter.vehicle = vehicle;
        if (status) filter.status = status;
        const logs = await MaintenanceLog.find(filter)
            .populate('vehicle', 'name licensePlate type')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create maintenance log
router.post('/', protect, async (req, res) => {
    try {
        const log = await MaintenanceLog.create({ ...req.body, createdBy: req.user._id });

        // Auto-set vehicle status to "In Shop"
        await Vehicle.findByIdAndUpdate(req.body.vehicle, { status: 'In Shop' });

        const populated = await MaintenanceLog.findById(log._id).populate('vehicle', 'name licensePlate');
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update maintenance log
router.put('/:id', protect, async (req, res) => {
    try {
        const log = await MaintenanceLog.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('vehicle', 'name licensePlate');
        if (!log) return res.status(404).json({ message: 'Log not found' });

        // If completed, set vehicle back to Available
        if (req.body.status === 'Completed' && log.vehicle) {
            await Vehicle.findByIdAndUpdate(log.vehicle._id, { status: 'Available' });
        }

        res.json(log);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE maintenance log
router.delete('/:id', protect, async (req, res) => {
    try {
        const log = await MaintenanceLog.findByIdAndDelete(req.params.id);
        if (!log) return res.status(404).json({ message: 'Log not found' });
        res.json({ message: 'Log removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
