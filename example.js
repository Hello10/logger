// LOGGER="foo:bar*|error,ping:pong|info,-ping:pong:pork" node example.js

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
let logger2 = new Logger({name: 'ping:pong', funk: 'derp'});
// This will be ignored because level is too low
logger2.debug('derp');
// This will be shown
logger2.error(new Error('dorf'));

logger2 = logger2.child('pork');
// This will be ignored because of the explicit exclude
logger2.fatal('bork');
