const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
    id: Number,
    name: String,
    address: String,
    time: Date,
    temperature: Number
}, {
    collection: 'sensors'
});


module.exports = {
    SensorModel: mongoose.model('Sensor', sensorSchema),
    sensorSchema: sensorSchema
};
