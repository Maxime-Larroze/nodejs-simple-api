var request = require('request');
var express = require('express')();
var expect = require('chai').expect;
var errorlog = require('../src/express-errorlog.js');

express.get('/test-1', function(req, res, next) { next(400) });
express.get('/test-2', function(req, res, next) { next(499) });
express.get('/test-3', function(req, res, next) { next(999) });
express.get('/test-4', function(req, res, next) { next({ status: 401, message: 'message for test-4' })  });
express.get('/test-5', function(req, res, next) { next({ status: 402, details: { testname: 'test-5' }}) });
express.get('/test-6', function(req, res, next) { next({ status: 403, message: 'message for test-6', details: { testname: 'test-6' }}) });
express.get('/test-7', function(req, res, next) { next({ message: 'message for test-7', details: { testname: 'test-7' }}) });
express.get('/test-8', function(req, res, next) { throw new Error('exception message for test-8') });

express.get('/test-9', function(req, res, next) {
  var error = Error('exception message for test-9');
  error.status = 410;
  error.details = { testname: 'test-9' };
  throw error;
});

express.get('/test-0', function(req, res, next) {
  var error = Error('exception message for test-0');
  next({
    status: 411,
    message: 'message for test-0',
    details: { testname: 'test-0' },
    error: error
  });
});

var logmessage = null;
var logwrapper = errorlog({ logger: function(message) {
  logmessage = message;
}});
express.use(logwrapper);

express.use(function(err, req, res, next) {
  return res.json(err);
});

describe('Express Error Handler', function() {

  var server = null;
  var url = null;

  before(function(done) {
    server = express.listen(0, '127.0.0.1', function(error) {
      if (error) done(error);
      var address = server.address();
      url = 'http://' + address.address + ':' + address.port;
      done();
    });
  });

  after(function(done) {
    if (server) server.close(done);
    else done();
  });

  it('should be a function', function() {
    expect(errorlog).to.be.a('function');
  });

  it('should work with a valid status number (400)', function(done) {
    request(url + '/test-1', function(error, response, body) {
      if (error) return done(error);
      try {
        expect(response.statusCode).to.equal(400);
        expect(response.statusMessage).to.equal('Bad Request');
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.eql({
          status: 400,
          message: 'Bad Request'
        });
        expect(logmessage).to.equal('ERROR - GET /test-1 (400) - Bad Request');

        return done();
      } catch (error) {
        return done(error);
      }
    });
  });

  it('should work with an unknown status number (499)', function(done) {
    request(url + '/test-2', function(error, response, body) {
      if (error) return done(error);
      try {
        expect(response.statusCode).to.equal(499);
        expect(response.statusMessage).to.equal('unknown');
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.eql({
          status: 499,
          message: 'Unknown status 499'
        });
        expect(logmessage).to.equal('ERROR - GET /test-2 (499) - Unknown status 499');

        return done();
      } catch (error) {
        return done(error);
      }
    });
  });

  it('should work with an invalid status number (999)', function(done) {
    request(url + '/test-3', function(error, response, body) {
      if (error) return done(error);
      try {
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.eql({
          status: 500,
          message: 'Unknown status 999'
        });
        expect(logmessage).to.equal('ERROR - GET /test-3 (500) - Unknown status 999');

        return done();
      } catch (error) {
        return done(error);
      }
    });
  });

  it('should work with status (401) and message', function(done) {
    request(url + '/test-4', function(error, response, body) {
      if (error) return done(error);
      try {
        expect(response.statusCode).to.equal(401);
        expect(response.statusMessage).to.equal('Unauthorized');
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.eql({
          status: 401,
          message: 'message for test-4'
        });
        expect(logmessage).to.equal('ERROR - GET /test-4 (401) - message for test-4');

        return done();
      } catch (error) {
        return done(error);
      }
    });
  });

  it('should work with status (402) and details', function(done) {
    request(url + '/test-5', function(error, response, body) {
      if (error) return done(error);
      try {
        expect(response.statusCode).to.equal(402);
        expect(response.statusMessage).to.equal('Payment Required');
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.eql({
          status: 402,
          message: 'Payment Required',
          details: { testname: 'test-5' }
        });
        expect(logmessage).to.equal('ERROR - GET /test-5 (402) - Payment Required\n  >>> {"testname":"test-5"}');

        return done();
      } catch (error) {
        return done(error);
      }
    });
  });

  it('should work with status (403), message and details', function(done) {
    request(url + '/test-6', function(error, response, body) {
      if (error) return done(error);
      try {
        expect(response.statusCode).to.equal(403);
        expect(response.statusMessage).to.equal('Forbidden');
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.eql({
          status: 403,
          message: 'message for test-6',
          details: { testname: 'test-6' }
        });
        expect(logmessage).to.equal('ERROR - GET /test-6 (403) - message for test-6\n  >>> {"testname":"test-6"}');

        return done();
      } catch (error) {
        return done(error);
      }
    });
  });

  it('should work with no status but only message and details', function(done) {
    request(url + '/test-7', function(error, response, body) {
      if (error) return done(error);
      try {
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.eql({
          status: 500,
          message: 'message for test-7',
          details: { testname: 'test-7' }
        });
       expect(logmessage).to.equal('ERROR - GET /test-7 (500) - message for test-7\n  >>> {"testname":"test-7"}');

        return done();
      } catch (error) {
        return done(error);
      }
    });
  });

  it('should work when simple exceptions are thrown', function(done) {
    request(url + '/test-8', function(error, response, body) {
      if (error) return done(error);
      try {
        expect(response.statusCode).to.equal(500);
        expect(response.statusMessage).to.equal('Internal Server Error');
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.eql({
          status: 500,
          message: 'exception message for test-8',
        });
        expect(logmessage).to.match(new RegExp(
          '^ERROR - GET /test-8 \\(500\\) - exception message for test-8' + '\n' +
          '  Error: exception message for test-8'                         + '\n' +
          '    at '));

        return done();
      } catch (error) {
        return done(error);
      }
    });
  });

  it('should work when complex exceptions are thrown', function(done) {
    request(url + '/test-9', function(error, response, body) {
      if (error) return done(error);
      try {
        expect(response.statusCode).to.equal(410);
        expect(response.statusMessage).to.equal('Gone');
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.eql({
          status: 410,
          message: 'exception message for test-9',
          details: { testname: 'test-9' }
        });
        expect(logmessage).to.match(new RegExp(
          '^ERROR - GET /test-9 \\(410\\) - exception message for test-9' + '\n' +
          '  >>> {"testname":"test-9"}'                                   + '\n' +
          '  Error: exception message for test-9'                         + '\n' +
          '    at '));

        return done();
      } catch (error) {
        return done(error);
      }
    });
  });

  it('should work when complex exceptions are mesked', function(done) {
    request(url + '/test-0', function(error, response, body) {
      if (error) return done(error);
      try {
        expect(response.statusCode).to.equal(411);
        expect(response.statusMessage).to.equal('Length Required');
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.eql({
          status: 411,
          message: 'message for test-0',
          details: { testname: 'test-0' }
        });
        expect(logmessage).to.match(new RegExp(
          '^ERROR - GET /test-0 \\(411\\) - message for test-0'                         + '\n' +
          '  >>> {"testname":"test-0"}'                                                 + '\n' +
          '  Error: exception message for test-0'                                       + '\n' +
          '    at '));

        return done();
      } catch (error) {
        return done(error);
      }
    });
  });

  it('should work expose the wrapped logger', function() {
    logwrapper.log.info('This is a test');
    expect(logmessage).to.equal(' INFO - This is a test');
    logwrapper.log.warn('This is a test');
    expect(logmessage).to.equal(' WARN - This is a test');
    logwrapper.log.error('This is a test');
    expect(logmessage).to.equal('ERROR - This is a test');
  });
})
