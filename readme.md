# redisclient

a lightweight wrapper around mrraney's redis lib to make it easier to adapt to backpressure

## use

```js

    var redisclient = require('redisclient');

    var redis = new redisclient({
        port: 22222
        // these options are passed verbatim to the redis client
        // host: '127.0.0.1',
        // port: 6379,
        // command_queue_high_water: 10000,
        // command_queue_low_water: 1000,
        // enable_offline_queue: true,
        // retry_delay: 1000,
        // retry_backoff: 1,
        // buffer_check_interval: 1000
    });

    redis.on('pause', function() {
        // example: we assume that data coming to redis can be paused
        // by pausing our input processing routine
        myInput.stop();
    });

    redis.on('resume', function() {
        // this will also get called after the first redis connection is made,
        // on the 'ready' event
        myInput.go();
    });

    redis.on('error', function(err) {
        console.log(err.stack || err);
    });

    // acces to the redis lib:
    redis.redis.get('key', function(err, val) { .... });

    // you can also query the status at any time:
    if(redis.paused)
        ....

```
