'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dispatchTrackingEvent;

var _customEvent = require('custom-event');

var _customEvent2 = _interopRequireDefault(_customEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function dispatchTrackingEvent(data) {
  document.dispatchEvent(new _customEvent2.default('FirehoseTrackingEvent', {
    detail: data
  }));
}