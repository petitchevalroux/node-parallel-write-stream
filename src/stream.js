"use strict";

var Writable = require("stream")
    .Writable;
var util = require("util");
var async = require("async");

function ConcurrentWritable(options) {
    if (!(this instanceof ConcurrentWritable)) {
        return new ConcurrentWritable(options);
    }
    this.writeCb = options.write;
    this.concurrency = options.concurrency ? options.concurrency : 2;
    var self = this;
    options.write = function(chunk, encoding, callback) {
        self._writeToQueue(chunk, encoding, callback);
    };
    Writable.call(this, options);
}
util.inherits(ConcurrentWritable, Writable);

ConcurrentWritable.prototype.write = function(chunk) {
    if (false === ConcurrentWritable.super_.prototype.write.apply(
            this, [chunk]
        )) {
        return false;
    }
    var queue = this._getQueue();
    return queue.length() < this.concurrency;
};

ConcurrentWritable.prototype._writeToQueue = function(chunk, encoding, callback) {
    this._getQueue()
        .push({
            "chunk": chunk,
            "encoding": encoding
        });
    callback();
};

ConcurrentWritable.prototype._getQueue = function() {
    if (!this.queue) {
        var self = this;
        this.queue = async.queue(function(args, callback) {
            self.writeCb(args.chunk, args.encoding, function(err) {
                self.emit("drain");
                callback(err);
            });
        }, this.concurrency);
    }
    return this.queue;
};

module.exports = ConcurrentWritable;
