const SensorTag = require('sensortag');
const async = require('async');
const sensorTagUtil = require('./sensorTagUtil');

module.exports = class SensorService {
    constructor(LoggerService) {
        this.activeDevices = {};
    }
    onInit(LoggerService) {
        this.logger = LoggerService;

        SensorTag.discoverAll((sensorTag) => {
            this.logger.debug(`Discovered: ${sensorTag.id}`);
            this.activeDevices[sensorTag.id] = {
                connected: false,
                sensor: sensorTag
            };
            this._connectToSensor(sensorTag, function () {
                this.logger.debug(`Connected to ${sensorTag.id}`);
            });
        });
    }
    sample(options, sensorReadingCallback) {
        if (typeof callback !== 'function') {
            callback = options;
            options = {};
        }
        //Loop through registered sensors
        Object.keys(activeDevices).forEach((deviceId) => {
            let sensorTag = this.activeDevices[deviceId].sensor;
            let payload = {
                "deviceId": sensorTag.id,
                "macAddress": sensorTag.address,
                "sensorType": sensorTag.type,
                "time": Date.now()
            };
            //Reading
            if (!this.activeDevices.connected) {
                return;
            }
            this.logger.debug(`Reading ${sensorTag.id}`);
            async.series([
                //Device Name
                (callback) => {
                    sensorTag.readDeviceName((error, deviceName) => {
                        if (error) { return callback(err) }
                        payload.name = deviceName;
                        callback();
                    });
                },
                //Humidity
                (callback) => {
                    sensorTagUtil.readHumidity(sensorTag, (err, data) => {
                        payload.temp = {
                            object: data[1].toFixed(1),
                            ambient: data[2].toFixed(1)
                        }
                    })
                },
                //Temperature
                (callback) => {
                    sensorTagUtil.readHumidity(sensorTag, (err, data) => {
                        payload.temp = {
                            temp: data[1].toFixed(1),
                            humidity: data[2].toFixed(1)
                        }
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
        sensorTag.connectAndSetUp(() => {
            this.activeDevices[sensorTag.id].connected = true;
            sensorTag.on('disconnect', () => {
                this.logger.error(`Disconnected From Sensor ${sensorTag.id}`);
                this._connectToSensor(sensorTag, () => {
                    this.logger.error(`Reconnected To Sensor ${sensorTag.id}`);
                })
            });
            callback();
        });
    }
}