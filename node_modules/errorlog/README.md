Simple Error Log
================

A very simple error logger/formatter for Node.

* [Install and use](#install-and-use)
* [Options and properties](#options-and-properties)
  * [Default Logger and Level](#default-logger-and-level)
* [Logging](#logging)
  * [Levels](#levels)
  * [Extras](#extras)
  * [Colorization](#colorization)
  * [Log rotation](#log-rotation)
* [License (MIT)](#license-mit-)



Install and use
---------------

Install as usual with _NPM_:

```bash
npm install --save errorlog
```

Then configure as the last route of your Express app:

```javascript
// Get our creator
var errorlog = require('errorlog');
// Create a new logger (with options!)
var log = errorlog(...);
// Foo! Log messages, errors, ...
log('My log message');
```



Options and properties
----------------------

The _error log_ can be constructed with the following options:

* `logger` may be one of the following:
  * a `Writable` _stream_ to which error messages will be written to (actually
    an object offering a `write(...)` function will do).
  * a simple `function` that will be invoked once with each message to log.
  * if unspecified this will default to `process.stderr`.
* `category`: a category name that will be inserted in the message to log.
* `level`: the minimum level to log messages at
  * `errorlog.TRACE` or `0`: really low priority messages.
  * `errorlog.DEBUG` or `100`: debugging messages.
  * `errorlog.INFO`  or `200`: informational messages _(default)_.
  * `errorlog.WARN`  or `300`: warning messages.
  * `errorlog.ERROR` or `400`: error messages.
  * `errorlog.FATAL` or `500`: fatel error messages.
  * `errorlog.ALL` or any number smaller than `100`: everything is logged.
  * `errorlog.OFF` or any number greater than `500`: disable logging.

Options can be specified at construction wrapped in a simple object:

```javascript
require('errorlog')({
  logger: process.stdout,
  category: 'my category',
  level: 200
});
```

Or can be specified as a single parameter (either a `Writable` _stream_, a
`function`, or a `string` identifying the category):

```javascript
// Forward errors to Winston's "error" facility
var winston = require('winston');
var errorlog = require('errorlog');

// Pass "winston.error" as a writer function
var log = errorlog(winston.error);
```

#### Default Logger and Level

The **default** `Writable` _stream_ or logging `function` can be configured
using the `defaultLog` property:

```javascript
var errorlog = require('errorlog');
errorlog.defaultLog = process.stdout;
errorlog.defaultLevel = errorlog.DEBUG;

// All logs will use `process.stdout` unless overridden
var log = errorlog('my category');
log('A message to log');
```

The default for output will be `process.stderr` and minimum level `ERROR`:
these values will be applied only to loggers created **after** setting them.

The default level can also be specified by using the `LOG_LEVEL` environment
variable.



Logging
-------

Needless to say, logging follow the standard `util.format` scheme:

```javascript
log.debug('I have %d %s, and an object %j', 3, 'apples', { foo: 'bar' });
```

This will produce an entry like

```text
2015-03-31T13:58:06.601Z - DEBUG - I have 3 apples and an object {"foo":"bar"}
```


#### Levels

Logging levels are associated to various functions of the logger, for example:

```javascript
var errorlog = require('errorlog');
var log = errorlog({...});

log('Default, logged unless everything is OFF');
log.debug('A debug message');
log.info('Informational message');
log.warn('Some sort of warning');
log.error('Like calling log(...)');
```


#### Extras

Extra parameters that do not match format characters will be logged in their
JSON format, and errors will have their stack traces logged, too. For example:

```javascript
var extra = { key: 'a simple value' };
var error = new Error('This is an error');
log.error('I have %d %s', 3, 'apples', extra, error);
```

Will produce something like

```text
2015-03-30T16:45:01.718Z - ERROR - I have 3 apples
  >>> {"key":"a simple value"}
  Error: This is an error
    at Error (native)
    at ... stacktrace continues ...
```


#### Colorization

If the configured `log` is either `process.stderr` (the default) or
`process.stderr`, the output to the console will be colorized.

> And now I wish GitHub didn't filter the `style` attribute...

This behavior can be changed by setting the `errorlog.defaultColorize` property
to `false`.

```javascript
var errorlog = require('errorlog');
errorlog.defaultColorize = false;

log('There you go, some bland output...');
```

To get an idea of the output, simply run the `sample.js` included here.


#### Log rotation

For log rotation `errorlog` plays nicely with packages like
[`logrotate-stream`](https://www.npmjs.com/package/logrotate-stream).


License (MIT)
-------------

Copyright (c) 2015 USRZ.com and Pier Paolo Fumagalli

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

