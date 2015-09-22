'use strict';
var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var debug        = require('debug')('meshblu-sonos');
var Sonos        = require('sonos');
var cSonos       = require('sonos').Sonos;

var MESSAGE_SCHEMA = {
  type: 'object',
  properties: {
    playUrl: {
      type: 'string',
      required: false
    }
  }
};

var OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    useCustomIP: {
      type: 'boolean',
      default: false,
      required: false
    },
    ip: {
      type: 'string',
      required: false
    },
  }
};


function Plugin(){
  debug('initializing');
  var self = this;
  self.options = {};
  self.messageSchema = MESSAGE_SCHEMA;
  self.optionsSchema = OPTIONS_SCHEMA;
  self.sonos = null;
  return self;
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(message){
  var self = this;
  var payload = message.payload || {};

  if(self.options.useCustomIP && self.options.ip){
    debug('using custom ip');
    self.sonos = new cSonos(self.options.ip);
    self.playUrl(payload.playUrl);
    return;
  }
  self.getDeviceIp(function(error, ipAddress){
    self.sonos = new cSonos(ipAddress);
    self.playUrl(payload.playUrl);
  });
};

Plugin.prototype.playUrl = function(url){
  var self = this;
  self.sonos.play(url, function (err, playing) {
    debug('play response', {error: err, playing: playing});
  });
};

Plugin.prototype.onConfig = function(device){
  var self = this;
  self.setOptions(device.options||{});
};

Plugin.prototype.getDeviceIp = function(callback){
  var self = this;
  if(self.discoveredIp){
    debug('ip address already discovered', self.discoveredIp);
    return callback(null, self.discoveredIp);
  }
  debug('discovering...');
  var search = Sonos.search();
  search.on('DeviceAvailable', function (device, model) {
    debug('device discovered', device, model);
    self.discoveredIp = device.host;
    debug('ipAddress', self.discoveredIp);
    callback(null, self.discoveredIp);
  })
}

Plugin.prototype.setOptions = function(options){
  var self = this;
  self.options = options || {};
};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
