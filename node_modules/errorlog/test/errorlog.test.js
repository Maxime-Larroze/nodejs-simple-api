'use strict';

var expect = require('chai').expect;
var errorlog = require('../src/errorlog.js');
// No color test!
errorlog.defaultColorize = false;

// A regular expression matching an ISO date
var expr = /^[\d]{4}-[\d]{2}-[\d]{2}T[\d]{2}:[\d]{2}:[\d]{2}\.[\d]{3}Z - (.*)/;

// Bleaurgh, a fake stream for test
function Stream() {
  var data = '';
  this.write = function write(string) {
    data += string;
  }
  this.check = function check() {
    var s = data;
    data = '';
    // Expect to match iso date
    expect(s).to.match(expr);
    return s.substr(27, s.length - 28);
  }
}

// Inject the default stream
var stream = errorlog.defaultLog = new Stream();

// The shared log for testing
var log = errorlog();

describe('Simple log test', function() {

  it('should expose some basic properties', function() {
    expect(errorlog).to.be.a('function');
    expect(errorlog.ALL  ).to.equal( -1);
    expect(errorlog.TRACE).to.equal(  0);
    expect(errorlog.DEBUG).to.equal(100);
    expect(errorlog.INFO ).to.equal(200);
    expect(errorlog.WARN ).to.equal(300);
    expect(errorlog.ERROR).to.equal(400);
    expect(errorlog.OFF  )  .to.equal(Number.MAX_SAFE_INTEGER);
    expect(errorlog.defaultLog).to.be.a('function');
    expect(errorlog.defaultLevel).to.equal(errorlog.INFO);
  });

  it('should log a simple message', function() {
    log('a simple message to log');
    expect(stream.check()).to.equal('  LOG - a simple message to log');
  });

  it('should log a simple exception', function() {
    log(new Error('simple error'));
    expect(stream.check()).to.match(/^  LOG - simple error\n  Error: simple error\n    at/m);
  });

  it('should log a formatted message', function() {
    log('number %d string %s json %j percent % and %% borked %x nan %d end', 123.456, 'foobar', { hello: 'world' }, 'foo' );
    expect(stream.check()).to.equal('  LOG - number 123.456 string foobar json {"hello":"world"} percent % and % borked %x nan NaN end');
  });

  it('should log a formatted message with insufficient arguments', function() {
    log('%d %d %d %d', 1, 2, 3);
    expect(stream.check()).to.equal('  LOG - 1 2 3 %d');
  });

  it('should log a formatted message with extra arguments', function() {
    log('%d %d %d %d', 1, 2, 3, 4, 5, 'hello', { foo: 'bar' });
    expect(stream.check()).to.equal('  LOG - 1 2 3 4\n  >>> 5\n  >>> "hello"\n  >>> {"foo":"bar"}');
  });

  it('should log a formatted message with an error', function() {
    log('test message', new Error('error title'));
    expect(stream.check()).to.match(/^  LOG - test message\n  Error: error title\n    at/m);
  });

  it('should log a formatted message with extra arguments and an error', function() {
    log('test %s message', 'nice', { foo: 'bar' }, new Error('error title'));
    expect(stream.check()).to.match(/^  LOG - test nice message\n  >>> {"foo":"bar"}\n  Error: error title\n    at/m);
  });

  it('should use a category', function() {
    errorlog('my own category')('A categorized message');
    expect(stream.check()).to.equal('  LOG - my own category: A categorized message');
  });

  it('should use a stream', function() {
    var logger = new Stream();

    log('this should go to the shared logger');
    errorlog(logger)('different logger');

    expect(stream.check()).to.equal('  LOG - this should go to the shared logger');
    expect(logger.check()).to.equal('  LOG - different logger');
  })

  it('should use a stream and a category', function() {
    var logger = new Stream();

    log('this should go to the shared logger');
    errorlog({logger: logger, category: 'foobar'})('different logger');

    expect(stream.check()).to.equal('  LOG - this should go to the shared logger');
    expect(logger.check()).to.equal('  LOG - foobar: different logger');
  })

  it('should use a function', function() {
    var data;
    var logger = function(string) { data = string };

    log('this should go to the shared logger');
    errorlog({logger: logger})('different logger');

    expect(stream.check()).to.equal('  LOG - this should go to the shared logger');
    expect(data).to.equal('  LOG - different logger');
  })

  it('should use a function and a category', function() {
    var data;
    var logger = function(string) { data = string };

    log('this should go to the shared logger');
    errorlog({logger: logger, category: 'foobar'})('different logger');

    expect(stream.check()).to.equal('  LOG - this should go to the shared logger');
    expect(data).to.equal('  LOG - foobar: different logger');
  })

  it('should honor the ALL level', function() {
    var data = [];
    var append = function(more) { data.push(more) };
    var logger = errorlog({level: 'all', logger: append});
    logger.debug('debug');
    logger.info ('info');
    logger.warn ('warn');
    logger.error('error');
    logger('log');
    expect(data).to.eql(['DEBUG - debug',' INFO - info',' WARN - warn','ERROR - error','  LOG - log']);
  })

  it('should honor the DEBUG level', function() {
    var data = [];
    var append = function(more) { data.push(more) };
    var logger = errorlog({level: 'debug', logger: append});
    logger.debug('debug');
    logger.info ('info');
    logger.warn ('warn');
    logger.error('error');
    logger('log');
    expect(data).to.eql(['DEBUG - debug',' INFO - info',' WARN - warn','ERROR - error','  LOG - log']);
  })

  it('should honor the INFO level', function() {
    var data = [];
    var append = function(more) { data.push(more) };
    var logger = errorlog({level: 'info', logger: append});
    logger.debug('debug');
    logger.info ('info');
    logger.warn ('warn');
    logger.error('error');
    logger('log');
    expect(data).to.eql([' INFO - info',' WARN - warn','ERROR - error','  LOG - log']);
  })

  it('should honor the WARN level', function() {
    var data = [];
    var append = function(more) { data.push(more) };
    var logger = errorlog({level: 'warn', logger: append});
    logger.debug('debug');
    logger.info ('info');
    logger.warn ('warn');
    logger.error('error');
    logger('log');
    expect(data).to.eql([' WARN - warn','ERROR - error','  LOG - log']);
  })

  it('should honor the ERROR level', function() {
    var data = [];
    var append = function(more) { data.push(more) };
    var logger = errorlog({level: 'error', logger: append});
    logger.debug('debug');
    logger.info ('info');
    logger.warn ('warn');
    logger.error('error');
    logger('log');
    expect(data).to.eql(['ERROR - error','  LOG - log']);
  })

  it('should honor the OFF level', function() {
    var data = [];
    var append = function(more) { data.push(more) };
    var logger = errorlog({level: 'off', logger: append});
    logger.debug('debug');
    logger.info ('info');
    logger.warn ('warn');
    logger.error('error');
    logger('log');
    expect(data).to.eql([]);
  })

  it('should honor switches in the default level', function() {
    var data = [];
    var append = function(more) { data.push(more) };

    var oldLevel = errorlog.defaultLevel;
    try {

      errorlog.defaultLevel = errorlog.OFF;
      var logger = errorlog({logger: append});

      logger('this should not show up');
      expect(data).to.eql([]);

      errorlog.defaultLevel = errorlog.ALL;
      logger('this must show up');
      expect(data).to.eql(['  LOG - this must show up']);

    } finally {
      errorlog.defaultLevel = oldLevel;
    }
  })

  it('should honor switches in the default log', function() {
    var data1 = [];
    var data2 = [];
    var append1 = function(more) { data1.push(more) };
    var append2 = function(more) { data2.push(more) };

    var oldLog = errorlog.defaultLog;
    try {
      errorlog.defaultLog = append1;

      var logger = errorlog();

      logger('logged to data 1');

      errorlog.defaultLog = append2;

      logger('logged to data 2');

      expect(data1).to.eql(['  LOG - logged to data 1']);
      expect(data2).to.eql(['  LOG - logged to data 2']);

    } finally {
      errorlog.defaultLog = oldLog;
    }
  })

  it('should parse every level string', function() {
    errorlog.defaultLevel = 'ALL'  ;
    expect(errorlog.defaultLevel).to.equal(-1);
    errorlog.defaultLevel = 'TRACE';
    expect(errorlog.defaultLevel).to.equal(0);
    errorlog.defaultLevel = 'DEBUG';
    expect(errorlog.defaultLevel).to.equal(100);
    errorlog.defaultLevel = 'INFO' ;
    expect(errorlog.defaultLevel).to.equal(200);
    errorlog.defaultLevel = 'WARN' ;
    expect(errorlog.defaultLevel).to.equal(300);
    errorlog.defaultLevel = 'ERROR';
    expect(errorlog.defaultLevel).to.equal(400);
    errorlog.defaultLevel = 'FATAL';
    expect(errorlog.defaultLevel).to.equal(500);
    errorlog.defaultLevel = 'OFF'  ;
    expect(errorlog.defaultLevel).to.equal(Number.MAX_SAFE_INTEGER);

  });

});

