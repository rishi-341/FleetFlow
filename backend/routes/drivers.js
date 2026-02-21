const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const { protect } = require('../middleware/auth');

// GET all drivers
router.get('/', protect, async (req, res) => {
    try {
        const { status, region } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (region) filter.region = region;
        const drivers = await Driver.find(filter).sort({ createdAt: -1 });
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single driver
router.get('/:id', protect, async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        res.json(driver);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create driver
router.post('/', protect, async (req, res) => {
    try {
        const driver = await Driver.create(req.body);
        res.status(201).json(driver);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update driver
router.put('/:id', protect, async (req, res) => {
    try {
        const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        res.json(driver);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE driver
router.delete('/:id', protect, async (req, res) => {
    try {
        const driver = await Driver.findByIdAndDelete(req.params.id);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        res.json({ message: 'Driver removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH toggle driver status
router.patch('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const driver = await Driver.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        res.json(driver);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
