'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = hoc;

var _withTrackingComponentDecorator = require('./withTrackingComponentDecorator');

var _withTrackingComponentDecorator2 = _interopRequireDefault(_withTrackingComponentDecorator);

var _trackEventMethodDecorator = require('./trackEventMethodDecorator');

var _trackEventMethodDecorator2 = _interopRequireDefault(_trackEventMethodDecorator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hoc(trackingInfo, options) {
  return function decorator() {
    if (arguments.length === 1) {
      // decorating a class
      return (0, _withTrackingComponentDecorator2.default)(trackingInfo, options).apply(undefined, arguments);
    }

    // decorating a method
    return (0, _trackEventMethodDecorator2.default)(trackingInfo).apply(undefined, arguments);
  };
}