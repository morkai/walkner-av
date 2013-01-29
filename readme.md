# ArenaVision Tester

## Requirements

### node.js

Node.js is a server side software system designed for writing scalable
Internet applications in JavaScript.

  * __Version__: 0.6.x
  * __Website__: http://nodejs.org/
  * __Download__: http://nodejs.org/download/
  * __Installation guide__: https://github.com/joyent/node/wiki/Installation

### MongoDB

MongoDB is a scalable, high-performance, open source NoSQL database.

  * __Version__: 2.x.x
  * __Website__: http://mongodb.org/
  * __Download__: http://www.mongodb.org/downloads
  * __Installation guide__: http://www.mongodb.org/display/DOCS/Quickstart

## Installation

Clone the repository:

```
git clone git://github.com/morkai/walkner-av.git
```

or [download](https://github.com/morkai/walkner-av/zipball/master)
and extract it.

Go to the project's directory and install the dependencies:

```
cd walkner-av/
npm install
```

## Configuration

Configuration files are the JavaScript files residing in the `config/`
directory.

### express.js

Configuration of the HTTP server [express](http://expressjs.com/).

  * `port` - port on which the HTTP server should listen.

### mongoose.js

Configuration of the _MongoDB_ client.

  * `uri` - connection URI in the following format:
    `mongodb://<host>[:<port>]/<dbname>`.

### logging.js

Logs configuration. Logs of the following levels will be redirected to `stdout`:
`log`, `debug`, `info`, `warn` and `error`.

  * `productionLevels` - object defining what logs should make it through
    the log filter, if the `NODE_ENV` is set to `production`.
  * `developmentLevels` - object defining what logs should make it through
    the log filter, if the `NODE_ENV` is set to `development`.

### auth.js

Configuration of authentication and authorization.

  * `superUser` - object of a user with all privileges.
    One can log in as a super user even if it's not in the database.
    Handy, if run on an empty database.
  * `guestUser` - object of a user assigned to not logged in browser clients.

### browser.js

Configuration of a browser that is started by the server when run in
the production environment.

  * `cmd` - command that opens a browser pointed to the application.

### controller.js

  * `simulation` - whether to run the simulation of a test if
    the `programRunning` tag changes to `1`.
  * `master` - configuration of a MODBUS master:

    * `timerFactor` - tags `programTime`, `hrsTime` and `hrsInterval`
      are multiplied by this value before sending them off to the slave.
    * `type` - connection and transport type.
      Possible values are: `tcp`, `tcp-rtu`, `tcp-ascii`, `serial-ascii`
      and `serial-rtu`.
    * `host` - slave host/IP address if using TCP connection.
    * `port` - slave listening port if using TCP connection.
    * `timeout` - default MODBUS request timeout.
    * `maxTimeouts` - if the number of consecutive timeouts is equal to
      `maxTimeouts`, then the connection is destroyed and recreated.
    * `unit` - default MODBUS slave unit ID.
    * `maxRetries` - a number of times a MODBUS request is retried on error
      before giving up and handing the error to the user's handler function.
    * `interval` - default interval between requests,
    * `maxConcurrentRequests` - how many parallel requests can be sent to
      the slave.
    * `requestOnReconnectDelay` - on reconnect, wait the specified number
      of milliseconds before executing the queued requests and transactions.

  * `transactions` - an array of objects describing tags and MODBUS
    transactions. The application expects the following 1 bit tags:
    `programRunning`, `runMode`, `selectedProgram1`, `selectedProgram2`
    and the following 32-bit signed int tags:
    `temperature`, `light`, `voltage`, `current`,
    `hrsIteration`, `predefinedTime1`, `predefinedTime2`
    and the following 4 32-bit signed int tags that must occupy consecutive
    registers: `hrsCount`, `hrsInterval`, `hrsTime`, `programTime`.
    Each object must have following properties:

    * `id` - an ID of the transaction.
    * `fn` - a MODBUS function code (`0x01`, `0x02` or `0x03`).
    * `address` - a starting address of the first tag.
    * `tags` - an array of tag names,
    * `writable` - whether the tags specified in this transaction are writable.
    * `interval` - a number of milliseconds between executions of
      this transaction.

  * `scalers` - an object specifying minimums, maximums and scaling function
    for tags.

    * `min` - if the read value is lower than the `min` value, it is set
      to `min`.
    * `max` - if the read value is greater than the `max` value, it is set
      to `max`.
    * `scaler` - a function that takes a raw value from MODBUS slave and
      transforms it to another value before handing it to application for
      further processing.

### interfaceMonitor.js

Configuration of the network interface monitor module.

  * `enabled` - whether to monitor the network interface.
  * `ipAddress` - an IP address to look for in `stdout` of `checkCmd`.
  * `checkCmd` - a command that returns the current IP address
    of the monitored network interface.
  * `restartCmd` - a command executed if the `ipAddress` could not be found
    in `stdout` of `checkCmd`.
  * `interval` - a number of milliseconds between `checkCmd` executions.

### serproxy.js

Configuration of the [serproxy](http://developer.berlios.de/project/showfiles.php?group_id=3590) daemon.

  * `enabled` - whether to spawn the process.
  * `cmd` - command to execute if `enabled` is `TRUE`.
  * `args` - an array of command arguments.
  * `opts` - `child_process.spawn` options.

### mongod.conf

Configuration of the MongoDB server. Description of the individual options can
be found in
[the MongoDB documentation](http://www.mongodb.org/display/DOCS/File+Based+Configuration).

## Start

If not yet running, start the MongoDB:

```
mongod -f walkner-av/config/mongod.conf
```

Start the application server in `development` or `production` environment:

  * under *nix:

    ```
    NODE_ENV=development node walkner-av/server/index.js
    ```

  * under Windows:

    ```
    SET NODE_ENV=development
    node walkner-av/server/index.js
    ```

To run the application in `production` environment one must have
[r.js](https://github.com/jrburke/r.js) properly set up and then execute the
following commands:

    $ r.js walkner-av/bin/build-client.js
    $ r.js walkner-av/bin/build-min.js

Application should be available on a port defined in `config/express.js` file
(`80` by default). Point the Internet browser to http://127.0.0.1/.

## License

This project is released under the
[CC BY-NC 3.0](https://raw.github.com/morkai/walkner-av/master/license.md).
