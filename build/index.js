'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _withTrackingComponentDecorator = require('./withTrackingComponentDecorator');

Object.defineProperty(exports, 'withTracking', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_withTrackingComponentDecorator).default;
  }
});

var _trackEventMethodDecorator = require('./trackEventMethodDecorator');

Object.defineProperty(exports, 'trackEvent', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_trackEventMethodDecorator).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }