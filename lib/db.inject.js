const elasticsearch = require('elasticsearch');
const httpAwsEs = require('http-aws-es');
const config = require('config');
const uuid = require('uuid/v1');

module.exports = class DbService {
    constructor() {
        this.db = new elasticsearch.Client({
            host: config.get('db').host,
            connectionClass: httpAwsEs,
            amazonES: {
                region: config.get('aws').region,
                accessKey: config.get('db').user,
                secretKey: process.env.AWS_USER_SECRET
            }
        });
        this.index = config.get('db').index;
        this.docType = config.get('db').type;
        this.docTtl = config.get('db').ttl;
    }
    onInit(LoggerService, callback) {
        this.logger = LoggerService;
        this.db.ping({}, (error) => {
            if (error) {
                this.logger.error(`Error connecting to db: ${JSON.stringify(error)}`)
            } else {
                this.logger.debug('Connected To DB');
            }
            callback(error);
        });
    }

    write(data, callback) {
        if (typeof callback !== 'function') {
            callback = () => { };
        }
        this.logger.debug('Writing: ' + JSON.stringify(data));
        this.db.create({
            id: uuid(),
            index: this.index,
            type: this.docType,
            ttl: this.docTtl,
            refresh: "true",
            body: data
        }, (err, response) => {
            if (err) {
                this.logger.error(`Failed to write document: ${JSON.stringify(err)}`);
            }
            else {
                this.logger.debug('Write Success');
            }
            callback(err, response);
        });
    }
}