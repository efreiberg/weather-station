const SensorTag = require('sensortag');
const async = require('async');
const sensorTagUtil = require('./sensorTagUtil');

module.exports = class SensorService {
    constructor(LoggerService) {
        this.activeDevices = {};
    }
    onInit(LoggerService) {
        this.logger = LoggerService;

        SensorTag.discover((sensorTag) => {
            this.logger.debug(`Discovered: ${sensorTag.id}`);
            this.activeDevices[sensorTag.id] = {
                connected: false,
                sensor: sensorTag
            };
        });
    }
    sample(options, sensorReadingCallback) {
        if (typeof sensorReadingCallback !== 'function') {
            sensorReadingCallback = options;
            options = {};
        }
        //Loop through registered sensors
        Object.keys(this.activeDevices).forEach((deviceId) => {
            let sensorTag = this.activeDevices[deviceId].sensor;
            let payload = {
                "deviceId": sensorTag.id,
                "sensorType": sensorTag.type,
                "time": Date.now()
            };
            this.logger.debug(`Reading ${sensorTag.id}`);
            async.series([
                //Connect To Sensor 
                (callback) => {
                    if (this.activeDevices[deviceId].connected === false) {
                        this._connectToSensor(sensorTag, callback);
                    }
                    else {
                        setImmediate(callback.bind(null));
                    }
                },
                //Temperature
                (callback) => {
                    sensorTagUtil.readTemperature(sensorTag, (error, data) => {
                        if (error) { return callback(error) }
                        payload.temp = {
                            object: data[0].toFixed(1),
                            ambient: data[1].toFixed(1)
                        }
                        callback();
                    })
                },
                //Humidity
                (callback) => {
                    sensorTagUtil.readHumidity(sensorTag, (error, data) => {
                        if (error) { return callback(error) }
                        payload.humidity = {
                            temp: data[0].toFixed(1),
                            humidity: data[1].toFixed(1)
                        }
                        callback();
                    })
                },
                //Pressure
                (callback) => {
                    sensorTagUtil.readPressure(sensorTag, (error, data) => {
                        if (error) { return callback(error) }
                        payload.barometer = {
                            pressure: data[0].toFixed(1)
                        }
                        callback();
                    })
                },
                //Light
                (callback) => {
                    sensorTagUtil.readLuxometer(sensorTag, (error, data) => {
                        if (error) { return callback(error) }
                        payload.luxmeter = {
                            lux: data[0].toFixed(1)
                        }
                        callback();
                    })
                }
            ], (err) => {
                if (err) {
                    this.logger.error(`Error Reading Sensor ${sensorTag.id} ` + err);
                    sensorReadingCallback(err);
                }
                else {
                    sensorReadingCallback(null, payload);
                }
            });
        });
    }
    _connectToSensor(sensorTag, callback) {
        this.activeDevices[sensorTag.id].connected = false;
        sensorTag.connectAndSetUp((err) => {
            if (err) { return callback(err) }
            this.activeDevices[sensorTag.id].connected = true;
            sensorTag.on('disconnect', () => {
                this.logger.error(`Disconnected From Sensor ${sensorTag.id}`);
            });
            callback();
        });
    }
}