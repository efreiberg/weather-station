const async = require('async');

function read(setting, sensorTag, callback) {
    let tasks = [
        (callback) => {
            sensorTag[`enable${setting}`](callback);
        },
        (callback) => {
            setTimeout(callback, 2000);
        },
        (callback) => {
            sensorTag[`read${setting}`](function (error) {
                if (error) { return callback(error) }
                let data = Array.prototype.slice.call(arguments, 1);
                callback(null, data);
            });
        },
        (callback) => {
            sensorTag[`disable${setting}`](callback);
        }
    ];

    async.series(tasks, function (err, responses) {
        if (err) { return callback(err) }
        //Return gathered data
        callback(null, responses[2]);
    })
}

function readHumidity(sensorTag, callback) {
    return read('Humidity', sensorTag, callback);
}

function readTemperature(sensorTag, callback) {
    return read('IrTemperature', sensorTag, callback);
}

function readPressure(sensorTag, callback) {
    return read('BarometricPressure', sensorTag, callback);
}

function readLuxometer(sensorTag, callback) {
    return read('Luxometer', sensorTag, callback);
}

module.exports = {
    readHumidity,
    readTemperature,
    readPressure,
    readLuxometer
}