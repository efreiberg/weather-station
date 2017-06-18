const SAMPLE_INTERVAL = 5 * 60 * 1000;
module.exports = class Main {
    constructor() {
        this.sensorService = null;
        this.dbService = null;
        this.intervalHandle = null;
    }

    onInit(DbService, SensorService) {
        this.sensorService = sensor;
        this.dbService = db;
    }

    start(options) {
        if (typeof options === 'undefined') {
            options = {};
        }
        let interval = options.interval || SAMPLE_INTERVAL;
        //Start sampling interval
        this.intervalHandle = setInterval(() => {
            this._sample();
        }, interval)
    }

    stop() {
        if (this.intervalHandle) {
            clearInterval(this.intervalHandle);
        }
    }
    _sample() {
        //Get data from sensor(s)
        this.sensorService.sample({}, (err, data) => {
            if (!err) {
                //Write to db
                this.dbService.write(data)
            }
        })

    }
}