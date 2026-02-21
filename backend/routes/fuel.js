const express = require('express');
const router = express.Router();
const FuelLog = require('../models/FuelLog');
const { protect } = require('../middleware/auth');

// GET all fuel logs
router.get('/', protect, async (req, res) => {
    try {
        const { vehicle } = req.query;
        const filter = {};
        if (vehicle) filter.vehicle = vehicle;
        const logs = await FuelLog.find(filter)
            .populate('vehicle', 'name licensePlate type')
            .populate('trip', 'tripNumber')
            .populate('createdBy', 'name')
            .sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create fuel log
router.post('/', protect, async (req, res) => {
    try {
        const log = await FuelLog.create({ ...req.body, createdBy: req.user._id });
        const populated = await FuelLog.findById(log._id).populate('vehicle', 'name licensePlate');
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE fuel log
router.delete('/:id', protect, async (req, res) => {
    try {
        const log = await FuelLog.findByIdAndDelete(req.params.id);
        if (!log) return res.status(404).json({ message: 'Log not found' });
        res.json({ message: 'Log removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
