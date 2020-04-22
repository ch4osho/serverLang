const test = require('test.config.js');
const prod = require('production.config.js');

const ENV = 'test';

var config = {};

if (ENV == 'test') {
    config = test.config;
}
if (ENV == 'prod') {
    config = prod.config;
}

const VERSION = '1.4.0';

module.exports = {
    VERSION,
    ...config
};
