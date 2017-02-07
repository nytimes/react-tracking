'use strict';

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _initDefineProp(target, property, descriptor, context) {
  if (!descriptor) return;
  (0, _defineProperty2.default)(target, property, {
    enumerable: descriptor.enumerable,
    configurable: descriptor.configurable,
    writable: descriptor.writable,
    value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
  });
}

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

function _initializerWarningHelper(descriptor, context) {
  throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
}

var wTCDmock = jest.fn(function () {
  return function () {};
});
jest.setMock('../withTrackingComponentDecorator', wTCDmock);

var tEMDmock = jest.fn(function () {
  return function () {};
});
jest.setMock('../trackEventMethodDecorator', tEMDmock);

describe('tracking HoC', function () {
  // eslint-disable-next-line global-require
  var trackingHoC = require('../trackingHoC').default;

  it('detects a class', function () {
    var _dec, _class;

    var TestClass = (_dec = trackingHoC({ testClass: true }), _dec(_class = function (_React$Component) {
      (0, _inherits3.default)(TestClass, _React$Component);

      function TestClass() {
        (0, _classCallCheck3.default)(this, TestClass);
        return (0, _possibleConstructorReturn3.default)(this, (TestClass.__proto__ || (0, _getPrototypeOf2.default)(TestClass)).apply(this, arguments));
      }

      return TestClass;
    }(_react2.default.Component)) || _class); // eslint-disable-line

    new TestClass(); // eslint-disable-line no-new

    expect(wTCDmock).toHaveBeenCalled();
  });

  it('detects a class method', function () {
    var _dec2, _desc, _value, _class2, _descriptor;

    var TestMethod = (_dec2 = trackingHoC({ testMethod: true }), (_class2 = function TestMethod() {
      (0, _classCallCheck3.default)(this, TestMethod);

      _initDefineProp(this, 'blah', _descriptor, this);
    }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'blah', [_dec2], {
      enumerable: true,
      initializer: function initializer() {
        return function () {};
      }
    })), _class2));


    var myTest = new TestMethod();
    myTest.blah();

    expect(tEMDmock).toHaveBeenCalled();
  });
});