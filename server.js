const injector = require('class-inject');

injector.init({ entry: require('./lib/main.inject').name }, (err, server) => {
    if (err) {
        console.log('Failed To Start: ', err.message);
    }
    else {
        console.log('Started!');
        process.on('exit', (code) => {
            console.log(`About to exit with code: ${code}`);
            server.stop();
        });
        server.start();
    }
});