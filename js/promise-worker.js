(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PromiseWorker = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

var messageIds = 0

function onMessage (self, e) {
  var message = e.data
  if (!Array.isArray(message) || message.length < 2) {
    // Ignore - this message is not for us.
    return
  }
  var messageId = message[0]
  var error = message[1]
  var result = message[2]

  var callback = self._callbacks[messageId]

  if (!callback) {
    // Ignore - user might have created multiple PromiseWorkers.
    // This message is not for us.
    return
  }

  delete self._callbacks[messageId]
  callback(error, result)
}

function PromiseWorker (worker) {
  var self = this
  self._worker = worker
  self._callbacks = {}

  worker.addEventListener('message', function (e) {
    onMessage(self, e)
  })
}

PromiseWorker.prototype.postMessage = function (userMessage) {
  var self = this
  var messageId = messageIds++

  var messageToSend = [messageId, userMessage]

  return new Promise(function (resolve, reject) {
    self._callbacks[messageId] = function (error, result) {
      if (error) {
        return reject(new Error(error.message))
      }
      resolve(result)
    }

    /* istanbul ignore if */
    if (typeof self._worker.controller !== 'undefined') {
      // service worker, use MessageChannels because e.source is broken in Chrome < 51:
      // https://bugs.chromium.org/p/chromium/issues/detail?id=543198
      var channel = new MessageChannel()
      channel.port1.onmessage = function (e) {
        onMessage(self, e)
      }
      self._worker.controller.postMessage(messageToSend, [channel.port2])
    } else {
      // web worker
      self._worker.postMessage(messageToSend)
    }
  })
}

module.exports = PromiseWorker

},{}]},{},[1])(1)
});
