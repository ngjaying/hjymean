/**
 * Monitor model events
 */

'use strict';

import {EventEmitter} from 'events';
var Monitor = require('./monitor.model');
var MonitorEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
MonitorEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Monitor.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    MonitorEvents.emit(event + ':' + doc._id, doc);
    MonitorEvents.emit(event, doc);
  }
}

export default MonitorEvents;
