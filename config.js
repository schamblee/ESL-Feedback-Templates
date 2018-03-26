'use strict';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://sjchamblee:priscilla@ds123499.mlab.com:23499/five-apple-feedback';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-five-apple-feedback';
exports.PORT = process.env.PORT || 8080;