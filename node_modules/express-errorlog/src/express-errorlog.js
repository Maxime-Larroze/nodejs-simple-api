'use strict';

var statuses = require('statuses');
var errorlog = require('errorlog');

function create(options) {
  options = options || {};
  var logger = errorlog(options);

  // Return our handler...
  function handler(err, req, res, next) {
    // By default, this is a 500
    var status = 500;
    var message = statuses[500];

    // Called as "next(404)"
    if (typeof(err) === 'number') {
      if (statuses[err]) {
        message = statuses[err];
        status = err;
      } else {
        message = 'Unknown status ' + err;
        status = err;
      }
    }

    // Called as "next('Uh-oh')"
    else if (typeof(err) === 'string') {
      message = err || message;
    }

    // Called next(...)
    else {
      // Preserve "err.status"
      if (typeof(err.status) === 'number') {
        status = err.status;
        message = statuses[status];
      } else if (err.status) {
        status = Number.parseInt(err.status);
        if (Number.isNan(status)) status = 500;
        message = statuses[status];
      }

      // Preserve "err.message"
      if (typeof(err.message) === 'string') {
        message = err.message;
      } else if (err.message) {
        message = err.message.toString();
      }
    }

    // Validate/normalize status
    if ((status < 100) || (status > 599)) status = 500;

    // Validate/normalize message
    message = message || statuses[status] || 'Unknown Error';

    // Build our logger call and response
    var format = '%s %s (%d) - %s';
    var args = [ req.method, req.originalUrl, status, message ];
    var response = { status: status, message: message };

    // Prepend any request id
    if (req.id) {
      response.request_id = req.id;
      format = '%s - ' + format;
      args.unshift(req.id);
    }

    // Append any details
    if (err.details) {
      response.details = err.details;
      args.push(err.details);
    }

    // Errors addition
    if (err.error) args.push(err.error);
    if (err instanceof Error) {
      delete err.details;
      delete err.status;
      delete err.error;
      args.push(err);
    }

    // Insert our format and log
    args.unshift(format);
    logger.error.apply(null, args);

    // Send back our response!
    res.statusCode = status;
    return next(response);
  }

  handler.log = logger;
  return handler;
}

var handler = create();

exports = module.exports = function(err, req, res, next) {
  if (arguments.length == 4) return handler(err, req, res, next);
  return create(err);
}
exports.log = handler.log;
