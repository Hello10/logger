/* eslint no-console: 0 */

import 'mocha';
import Assert from 'assert';
import Sinon from 'sinon';

import Logger from './Logger';

const Levels = Logger.Levels.filter((level)=> {
  return (level !== 'fatal');
});

describe('Logger', function () {
  let logger;

  beforeEach(function () {
    for (const level of Levels) {
      Sinon.spy(console, level);
    }
    logger = new Logger({
      hello: 10
    });
  });

  afterEach(function () {
    for (const level of Levels) {
      console[level].restore();
    }
  });

  function getLastCallArgs ({level}) {
    const call = ((level === 'fatal') ? console.error : console[level]).getCall(0);
    return call.args[0];
  }

  function assertLastCallArgs ({level, output}) {
    const args = getLastCallArgs({level});
    Assert.deepEqual(args, output);
  }

  describe('should support', function () {
    for (const level of Logger.Levels) {
      it(`.${level}`, function () {
        logger[level]('hello');
        assertLastCallArgs({
          level,
          output: {
            hello: 10,
            msg: 'hello'
          }
        });
      });
    }
  });

  describe('.child', function () {
    it('should create child with augmented context', function () {
      const child = logger.child({barf: 'borf'});
      child.log('donky');
      assertLastCallArgs({
        level: 'log',
        output: {hello: 10, barf: 'borf', msg: 'donky'}
      });
    });
  });

  describe('should handle logging errors', function () {
    it('single error argument', function () {
      const error = new Error('Honk');
      logger.error(error);
      const args = getLastCallArgs({
        level: 'error'
      });
      Assert.equal(args.msg, 'Honk');
      Assert.equal(args.hello, 10);
      console.log(args.err instanceof Error);
      Assert(args.err.match(/Error: Honk/));
    });

    it('custom error message', function () {
      const error = new Error('Honk');
      logger.error(error, 'Womp');
      const args = getLastCallArgs({
        level: 'error'
      });
      Assert.equal(args.msg, 'Womp');
      Assert.equal(args.hello, 10);
      console.log(args.err instanceof Error);
      Assert(args.err.match(/Error: Honk/));
    });
  });
});
