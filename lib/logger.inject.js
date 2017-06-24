const config = require('config');
const LEVELS = {
    DEBUG: 3,
    WARN: 2,
    ERROR: 1
}

module.exports = class LoggerService {
    constructor() { }
    onInit() {
        let logConfig = config.get('logger');
        this.level = LEVELS[logConfig.level] || LEVELS.DEBUG;
    }
    debug(msg) {
        this.level >= LEVELS.DEBUG && console.log(msg);
    }
    error(msg) {
        this.level >= LEVELS.ERROR && console.error(msg);
    }
    warn(msg) {
        this.level >= LEVELS.WARN && console.warn(msg);
    }
}