const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const MaintenanceLog = require('../models/MaintenanceLog');
const { protect } = require('../middleware/auth');

// GET all vehicles
router.get('/', protect, async (req, res) => {
    try {
        const { type, status, region } = req.query;
        const filter = {};
        if (type) filter.type = type;
        if (status) filter.status = status;
        if (region) filter.region = region;
        const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single vehicle
router.get('/:id', protect, async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create vehicle
router.post('/', protect, async (req, res) => {
    try {
        const vehicle = await Vehicle.create(req.body);
        res.status(201).json(vehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update vehicle
router.put('/:id', protect, async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        res.json(vehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE vehicle
router.delete('/:id', protect, async (req, res) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        res.json({ message: 'Vehicle removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH toggle out of service
router.patch('/:id/toggle-service', protect, async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        vehicle.status = vehicle.status === 'Out of Service' ? 'Available' : 'Out of Service';
        await vehicle.save();
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
