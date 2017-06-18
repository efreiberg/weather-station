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
                if (err) { return callback(err) }
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
    return ('Humidity', sensorTag, callback);
}

function readTemperature(sensorTag) {
    return ('IrTemperature', sensorTag, callback);
}

module.exports = {
    readHumidity,
    readTemperature
}