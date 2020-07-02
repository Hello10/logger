// following two are equivalent
// LOGGER="error|foo:bar*,ping:pong" node derp.js
// LOGGER_NAMES="foo:bar*,ping:pong" LOGGER_LEVEL="error" node derp.js

import Logger from './dist';

let logger = new Logger({name: 'foo', something: 'wow'});
// this will be ignored because name fails to match and level too low
logger.info('hi');
// this will be ignored because name fails to match
logger.error('wow');

// Create a new child logger
logger = logger.child('bar');
// This will be shown
logger.error('oh no');

// Create another logger
const logger2 = new Logger({name: 'ping:pong', funk: 'derp'});
// This will be ignored because level is too low
logger2.info('derp');
// This will be shown
logger2.error(new Error('dorf'));
