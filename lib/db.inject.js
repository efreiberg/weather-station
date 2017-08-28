const config = require('config');
const uuid = require('uuid/v4');
const request = require('request');

module.exports = class DbService {
    constructor() {
        this.dataUrl = config.get('services').data;
    }
    onInit(LoggerService) {
        this.logger = LoggerService;
    }

    write(data, callback) {
        if (typeof callback !== 'function') {
            callback = () => { };
        }
        //Add uid
        data = Object.assign({ id: uuid() }, data);

        this.logger.debug('Writing: ' + JSON.stringify(data));
        request({
            url: this.dataUrl,
            method: 'POST',
            json: true,
            body: data,
        }, (err, response) => {
            if (err) {
                this.logger.error(`Failed to write document: ${JSON.stringify(err)}`);
            }
            else {
                this.logger.debug('Write Success');
            }
            callback(err, response);
        })
    }
}