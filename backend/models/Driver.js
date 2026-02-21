const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, lowercase: true, trim: true },
    phone: { type: String },
    licenseNumber: { type: String, required: true, unique: true },
    licenseCategory: {
        type: [String],
        enum: ['Truck', 'Van', 'Bike'],
        required: true,
    },
    licenseExpiry: { type: Date, required: true },
    status: {
        type: String,
        enum: ['On Duty', 'Off Duty', 'On Trip', 'Suspended'],
        default: 'Off Duty',
    },
    safetyScore: { type: Number, default: 100, min: 0, max: 100 },
    totalTrips: { type: Number, default: 0 },
    completedTrips: { type: Number, default: 0 },
    region: { type: String, default: 'Central' },
    notes: { type: String },
}, { timestamps: true });

// Virtual: is license expired?
DriverSchema.virtual('isLicenseExpired').get(function () {
    return new Date(this.licenseExpiry) < new Date();
});

DriverSchema.set('toJSON', { virtuals: true });
DriverSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Driver', DriverSchema);
