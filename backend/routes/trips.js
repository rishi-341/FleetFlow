const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const { protect } = require('../middleware/auth');

// GET all trips
router.get('/', protect, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;
        const trips = await Trip.find(filter)
            .populate('vehicle', 'name licensePlate type maxCapacity')
            .populate('driver', 'name licenseNumber status')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single trip
router.get('/:id', protect, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id)
            .populate('vehicle')
            .populate('driver')
            .populate('createdBy', 'name');
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        res.json(trip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST create trip (with validation)
router.post('/', protect, async (req, res) => {
    try {
        const { vehicle: vehicleId, driver: driverId, cargoWeight } = req.body;

        // Check vehicle availability and capacity
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        if (vehicle.status !== 'Available')
            return res.status(400).json({ message: `Vehicle is currently ${vehicle.status}` });
        if (cargoWeight > vehicle.maxCapacity)
            return res.status(400).json({
                message: `Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxCapacity}kg)`,
            });

        // Check driver availability and license
        const driver = await Driver.findById(driverId);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        if (driver.status === 'On Trip' || driver.status === 'Suspended')
            return res.status(400).json({ message: `Driver is currently ${driver.status}` });
        if (new Date(driver.licenseExpiry) < new Date())
            return res.status(400).json({ message: 'Driver license is expired. Cannot assign trip.' });
        if (!driver.licenseCategory.includes(vehicle.type))
            return res.status(400).json({ message: `Driver is not licensed for ${vehicle.type}` });

        const trip = await Trip.create({ ...req.body, createdBy: req.user._id });

        // Update vehicle and driver status
        vehicle.status = 'On Trip';
        await vehicle.save();
        driver.status = 'On Trip';
        driver.totalTrips += 1;
        await driver.save();

        const populated = await Trip.findById(trip._id)
            .populate('vehicle', 'name licensePlate type')
            .populate('driver', 'name licenseNumber');
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PATCH update trip status lifecycle
router.patch('/:id/status', protect, async (req, res) => {
    try {
        const { status, endOdometer, revenue, distanceKm } = req.body;
        const trip = await Trip.findById(req.params.id).populate('vehicle').populate('driver');
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        const prevStatus = trip.status;
        trip.status = status;

        if (status === 'Dispatched') {
            trip.startTime = new Date();
        }

        if (status === 'Completed') {
            trip.endTime = new Date();
            if (endOdometer) trip.endOdometer = endOdometer;
            if (revenue !== undefined) trip.revenue = revenue;
            if (distanceKm) trip.distanceKm = distanceKm;

            // Update vehicle odometer and availability
            const vehicle = await Vehicle.findById(trip.vehicle._id);
            if (vehicle) {
                if (endOdometer) vehicle.odometer = endOdometer;
                vehicle.status = 'Available';
                await vehicle.save();
            }

            // Update driver stats
            const driver = await Driver.findById(trip.driver._id);
            if (driver) {
                driver.status = 'Off Duty';
                driver.completedTrips += 1;
                await driver.save();
            }
        }

        if (status === 'Cancelled') {
            // Free up vehicle and driver
            const vehicle = await Vehicle.findById(trip.vehicle._id);
            if (vehicle && vehicle.status === 'On Trip') {
                vehicle.status = 'Available';
                await vehicle.save();
            }
            const driver = await Driver.findById(trip.driver._id);
            if (driver && driver.status === 'On Trip') {
                driver.status = 'Off Duty';
                await driver.save();
            }
        }

        await trip.save();
        res.json(trip);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE trip
router.delete('/:id', protect, async (req, res) => {
    try {
        const trip = await Trip.findByIdAndDelete(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        res.json({ message: 'Trip removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
