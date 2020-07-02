# Logger
![](/logger.jpg)

## What?
Log json in an easily consumable and readable format.

## Why?
You want visibility across both applications and their dependencies easily configured using environment variables, with messsage filtering/addressability based on both logger name and level in order avoid having to do [this](https://github.com/trentm/node-bunyan#level-suggestions). Based on parts of [bunyan](https://github.com/trentm/node-bunyan) and [debug](https://github.com/visionmedia/debug).

## Example

```JavaScript
// following two are equivalent
// LOGGER="error|foo:bar*,ping:pong" node derp.js
// LOGGER_NAMES="foo:bar*,ping:pong" LOGGER_LEVEL="error" node derp.js

import Logger from '@hello10/logger';

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
```

### Output
```
oh no { name: 'foo:bar',
  something: 'wow',
  message: 'oh no',
  time: '2020-07-02T22:18:12.257Z' }
dorf { name: 'ping:pong',
  funk: 'derp',
  message: 'dorf',
  error:
   '{"stack":"Error: dorf ...<STACKTRACE HERE>","message":"dorf"}',
  time: '2020-07-02T22:18:12.269Z' }
```

## Todo
- Add configured payload serializers (i.e. `error`, `request`, `response`)
- Allow configurability for fixed keys i.e . `time`, `error` and `message` so people can use `ts`, `err`, `msg` etc.
- Allow for not logging the message as prefix
