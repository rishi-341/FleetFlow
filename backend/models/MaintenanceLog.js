const mongoose = require('mongoose');

const MaintenanceLogSchema = new mongoose.Schema({
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    serviceType: {
        type: String,
        required: true,
        enum: ['Oil Change', 'Tire Replacement', 'Brake Service', 'Engine Repair', 'Transmission', 'Electrical', 'Body Work', 'Other'],
    },
    description: { type: String },
    cost: { type: Number, required: true, default: 0 },
    serviceDate: { type: Date, required: true, default: Date.now },
    completedDate: { type: Date },
    vendor: { type: String },
    status: { type: String, enum: ['Ongoing', 'Completed'], default: 'Ongoing' },
    odometer: { type: Number },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceLog', MaintenanceLogSchema);
