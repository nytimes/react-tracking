'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _apply = require('babel-runtime/core-js/reflect/apply');

var _apply2 = _interopRequireDefault(_apply);

exports.default = trackEventMethodDecorator;

var _makeClassMemberDecorator = require('./makeClassMemberDecorator');

var _makeClassMemberDecorator2 = _interopRequireDefault(_makeClassMemberDecorator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function trackEventMethodDecorator() {
  var trackingData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return (0, _makeClassMemberDecorator2.default)(function (decoratedFn) {
    return function decorateClassMember() {
      if (this.props && typeof this.props.trackEvent === 'function') {
        var thisTrackingData = typeof trackingData === 'function' ? trackingData(this.props, arguments) : trackingData;
        this.props.trackEvent(thisTrackingData);
      }

      return (0, _apply2.default)(decoratedFn, this, arguments);
    };
  });
} /* eslint-disable prefer-rest-params */