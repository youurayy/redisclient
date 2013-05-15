# redisclient

a lightweight wrapper to make

## use

```js

    var redisclient = require('redisclient');

    var redis = new redisclient({
        port: 22222
        // check the source for more options
        // these options are also passed verbatim to the redis client
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
