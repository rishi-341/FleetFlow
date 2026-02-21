const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    licensePlate: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['Truck', 'Van', 'Bike'], required: true },
    maxCapacity: { type: Number, required: true }, // in kg
    odometer: { type: Number, default: 0 }, // in km
    region: { type: String, default: 'Central' },
    acquisitionCost: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['Available', 'On Trip', 'In Shop', 'Out of Service'],
        default: 'Available',
    },
    year: { type: Number },
    notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);
