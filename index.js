'use strict';
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('meshblu-sonos');
var Sonos = require('sonos');
var cSonos = require('sonos').Sonos;
var search = Sonos.search();
var ip;
var discoveredIp;
var sonos;


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


search.on('DeviceAvailable', function (device, model) {
    console.log(device, model)
    discoveredIp = device.host;
    console.log(discoveredIp);

  })

function Plugin(){
  this.options = {};
  this.messageSchema = MESSAGE_SCHEMA;
  this.optionsSchema = OPTIONS_SCHEMA;
  return this;
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(message){
  var payload = message.payload;
 // this.emit('message', {devices: ['*'], topic: 'echo', payload: payload});

  sonos.play(payload.playUrl, function (err, playing) {
  console.log([err, playing])
})


};

Plugin.prototype.onConfig = function(device){
  this.setOptions(device.options||{});
  var self = this;
  

if(self.options.useCustomIP){
    sonos = new cSonos(self.options.ip);
  }else{

    sonos = new cSonos(discoveredIp);
  }

    

};

Plugin.prototype.setOptions = function(options){
  this.options = options;
};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};
