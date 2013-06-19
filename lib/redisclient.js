
var redis = require('redis');
var _ = require('underscore');
var clone = require('clone');
var util = require('util');
var events = require("events");

/*
    var redis = new RedisClient({ port: 22222 });
    redis.on('pause', function() { myInput.stop(); });
    redis.on('resume', function() { myInput.go(); });
    redis.on('error', function(err) { console.log(err.stack || err); });
*/

var RedisClient = function RedisClient(opts) {

    var t = this;

    if(opts.url) {
        var m = /^([^:]+):(\d+)$/.exec(opts.url);
        if(!m)
            _e('invalid redis address: ' + opts.url);
        var host = m[1];
        var port = m[2];
    }

    t.opts = _.defaults(clone(opts), {
        host: host || '127.0.0.1',
        port: port || 6379,
        command_queue_high_water: 10000,
        command_queue_low_water: 1000,
        enable_offline_queue: true,
        retry_delay: 1000,
        retry_backoff: 1,
        buffer_check_interval: 1000
    });

    t.redis = redis.createClient(t.opts.port, t.opts.host, t.opts);
    t.redis.retry_delay = t.opts.retry_delay;
    t.redis.retry_backoff = t.opts.retry_backoff;
    t.paused = true;

    function _resume() {
        try {
            t.emit('resume');
        }
        catch(err) {
            t.emit('error', err);
        }
    }

    function _pause() {
        try {
            t.emit('pause');
        }
        catch(err) {
            t.emit('error', err);
        }
    }

    t.resume = function() {
        if(t.paused) {
            t.paused = false;
            setImmediate(_resume);
        }
    };

    t.pause = function() {
        if(!t.paused) {
            t.paused = true;
            setImmediate(_pause);
        }
    };

    t.timer = setInterval(function() {
        if(t.redis.should_buffer)
            t.pause();
        else
            t.resume();
    }, t.opts.buffer_check_interval);

    t.redis.on('ready', t.resume);
    t.redis.on('drain', t.resume);
    t.redis.on('end', t.pause);

    function error(err) {
        if(t.listeners('error').length)
            t.emit('error', err);
        else
            console.log(err.stack || err);
    }

    t.redis.on('error', error);
    t.redis.on('reply error', error);

    t.close = function() {
        clearInterval(t.timer);
        t.pause();
        // .end() wasn't closing nutcracker connection
        // .end() can still be called as redisclient.redis.end();
        t.redis.quit();
    };
};

util.inherits(RedisClient, events.EventEmitter);

module.exports = RedisClient;
