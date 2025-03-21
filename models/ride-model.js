const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'captains',
    },
    pickup: {
        type: String,
        required: true,
    },
    pickupLocation: {  
        latitude: { type: Number, required: true },  
        longitude: { type: Number, required: true }  
    },
    destination: {
        type: String,
        required: true,
    },
    destinationLocation: {  
        latitude: { type: Number },  
        longitude: { type: Number }  
    },
    fare: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: [ 'pending', 'accepted', "ongoing", 'completed', 'cancelled' ],
        default: 'pending',
    },
    duration: {
        type: Number,
    }, // in seconds
    distance: {
        type: Number,
    }, // in meters
    paymentID: {
        type: String,
    },
    orderId: {
        type: String,
    },
    signature: {
        type: String,
    },
    otp: {
        type: String,
        select: false,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('ride', rideSchema);
