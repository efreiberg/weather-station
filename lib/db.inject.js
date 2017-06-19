const elasticsearch = require('elasticsearch');
const httpAwsEs = require('http-aws-es');
const config = require('config');

module.exports = class DbService {
    constructor() {
        this.db = new elasticsearch.Client({
            host: config.get('db').host,
            connectionClass: httpAwsEs,
            amazonES: {
                region: 'us-east-1',
                accessKey: config.get('db').user,
                secretKey: process.env.AWS_USER_SECRET
            }
        });
    }
    onInit(LoggerService, callback) {
        this.logger = LoggerService;
        this.db.ping({
        }, (error) => {
            if (error) {
                this.logger.error(`Error connecting to db: ${JSON.stringify(error)}`)
            } else {
                this.logger.debug('Connected To DB');
            }
            callback(error);
        });
    }

    write(data, callback) {
        this.logger.debug('Writing: ' + JSON.stringify(data));
    }
}