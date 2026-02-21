const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    tripNumber: { type: String, unique: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    cargoDescription: { type: String },
    cargoWeight: { type: Number, required: true }, // kg
    distanceKm: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
        default: 'Draft',
    },
    startOdometer: { type: Number },
    endOdometer: { type: Number },
    startTime: { type: Date },
    endTime: { type: Date },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-generate trip number
TripSchema.pre('save', async function (next) {
    if (!this.tripNumber) {
        const count = await mongoose.model('Trip').countDocuments();
        this.tripNumber = `TRIP-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Trip', TripSchema);
