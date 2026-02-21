const mongoose = require('mongoose');

const FuelLogSchema = new mongoose.Schema({
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    liters: { type: Number, required: true },
    costPerLiter: { type: Number, required: true },
    totalCost: { type: Number },
    date: { type: Date, required: true, default: Date.now },
    odometer: { type: Number },
    station: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-calculate total cost
FuelLogSchema.pre('save', function (next) {
    this.totalCost = this.liters * this.costPerLiter;
    next();
});

module.exports = mongoose.model('FuelLog', FuelLogSchema);
