const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const FuelLog = require('../models/FuelLog');
const MaintenanceLog = require('../models/MaintenanceLog');
const { protect } = require('../middleware/auth');

// GET dashboard KPIs
router.get('/dashboard', protect, async (req, res) => {
    try {
        const [vehicles, drivers, trips, fuelLogs, maintLogs] = await Promise.all([
            Vehicle.find(),
            Driver.find(),
            Trip.find(),
            FuelLog.find(),
            MaintenanceLog.find(),
        ]);

        const activeFleet = vehicles.filter((v) => v.status === 'On Trip').length;
        const maintenanceAlerts = vehicles.filter((v) => v.status === 'In Shop').length;
        const available = vehicles.filter((v) => v.status === 'Available').length;
        const utilizationRate =
            vehicles.length > 0
                ? Math.round((activeFleet / vehicles.length) * 100)
                : 0;
        const pendingCargo = trips.filter((t) => t.status === 'Draft').length;
        const totalFuelCost = fuelLogs.reduce((sum, f) => sum + (f.totalCost || 0), 0);
        const totalMaintCost = maintLogs.reduce((sum, m) => sum + (m.cost || 0), 0);
        const completedTrips = trips.filter((t) => t.status === 'Completed').length;
        const expiredDrivers = drivers.filter(
            (d) => new Date(d.licenseExpiry) < new Date()
        ).length;

        res.json({
            activeFleet,
            maintenanceAlerts,
            utilizationRate,
            pendingCargo,
            totalVehicles: vehicles.length,
            availableVehicles: available,
            totalDrivers: drivers.length,
            totalFuelCost: Math.round(totalFuelCost),
            totalMaintCost: Math.round(totalMaintCost),
            totalOperationalCost: Math.round(totalFuelCost + totalMaintCost),
            completedTrips,
            totalTrips: trips.length,
            expiredDrivers,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET per-vehicle analytics (fuel efficiency, ROI, cost-per-km)
router.get('/vehicles', protect, async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        const result = [];

        for (const v of vehicles) {
            const fuelLogs = await FuelLog.find({ vehicle: v._id });
            const maintLogs = await MaintenanceLog.find({ vehicle: v._id });
            const trips = await Trip.find({ vehicle: v._id, status: 'Completed' });

            const totalFuel = fuelLogs.reduce((s, f) => s + (f.totalCost || 0), 0);
            const totalLiters = fuelLogs.reduce((s, f) => s + (f.liters || 0), 0);
            const totalMaint = maintLogs.reduce((s, m) => s + (m.cost || 0), 0);
            const totalRevenue = trips.reduce((s, t) => s + (t.revenue || 0), 0);
            const totalDistance = trips.reduce((s, t) => s + (t.distanceKm || 0), 0);

            const fuelEfficiency = totalDistance > 0 && totalLiters > 0
                ? (totalDistance / totalLiters).toFixed(2)
                : 0;
            const costPerKm = totalDistance > 0
                ? ((totalFuel + totalMaint) / totalDistance).toFixed(2)
                : 0;
            const roi =
                v.acquisitionCost > 0
                    ? (
                        ((totalRevenue - (totalMaint + totalFuel)) / v.acquisitionCost) *
                        100
                    ).toFixed(2)
                    : 0;

            result.push({
                _id: v._id,
                name: v.name,
                licensePlate: v.licensePlate,
                type: v.type,
                status: v.status,
                totalFuelCost: Math.round(totalFuel),
                totalMaintCost: Math.round(totalMaint),
                totalCost: Math.round(totalFuel + totalMaint),
                totalRevenue: Math.round(totalRevenue),
                totalDistance: Math.round(totalDistance),
                fuelEfficiency,
                costPerKm,
                roi,
                tripsCompleted: trips.length,
            });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
