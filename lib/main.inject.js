const SAMPLE_INTERVAL = 60 * 1000;
module.exports = class Main {
    constructor() { }

    onInit(DbService, SensorService) {
        this.sensorService = SensorService;
        this.dbService = DbService;
        this._intervalHandle = null;
    }

    start(options) {
        if (typeof options === 'undefined') {
            options = {};
        }
        let interval = options.interval || SAMPLE_INTERVAL;
        //Start sampling interval
        this._intervalHandle = setInterval(() => {
            this._sample();
        }, interval)
    }

    stop() {
        if (this._intervalHandle) {
            clearInterval(this._intervalHandle);
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