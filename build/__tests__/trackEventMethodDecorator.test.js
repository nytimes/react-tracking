'use strict';

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _getOwnPropertyDescriptor = require('babel-runtime/core-js/object/get-own-property-descriptor');

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

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

function _initializerWarningHelper(descriptor, context) {
  throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
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

describe('trackEventMethodDecorator', function () {
  // eslint-disable-next-line global-require
  var trackEventMethodDecorator = require('../trackEventMethodDecorator').default;

  it('is a decorator (exports a function, that returns a function)', function () {
    expect(typeof trackEventMethodDecorator === 'undefined' ? 'undefined' : (0, _typeof3.default)(trackEventMethodDecorator)).toBe('function');

    var decorated = trackEventMethodDecorator();
    expect(typeof decorated === 'undefined' ? 'undefined' : (0, _typeof3.default)(decorated)).toBe('function');
  });

  it('properly calls trackEvent when trackingData is a plain object', function () {
    var _dec, _desc, _value, _class;

    var dummyData = {};
    var trackingData = dummyData;
    var trackEvent = jest.fn();
    var spyTestEvent = jest.fn();

    var TestClass = (_dec = trackEventMethodDecorator(trackingData), (_class = function () {
      function TestClass() {
        (0, _classCallCheck3.default)(this, TestClass);

        this.props = { trackEvent: trackEvent };
      }

      (0, _createClass3.default)(TestClass, [{
        key: 'handleTestEvent',
        value: function handleTestEvent(x) {
          // eslint-disable-line class-methods-use-this
          spyTestEvent(x);
        }
      }]);
      return TestClass;
    }(), (_applyDecoratedDescriptor(_class.prototype, 'handleTestEvent', [_dec], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'handleTestEvent'), _class.prototype)), _class));


    var myTC = new TestClass();
    myTC.handleTestEvent('x');

    expect(trackEvent).toHaveBeenCalledWith(dummyData);
    expect(spyTestEvent).toHaveBeenCalledWith('x');
  });

  it('properly calls trackEvent when trackingData is a function', function () {
    var _dec2, _desc2, _value2, _class2, _descriptor;

    var dummyData = {};
    var trackingData = jest.fn(function () {
      return dummyData;
    });
    var trackEvent = jest.fn();
    var spyTestEvent = jest.fn();

    var TestClass = (_dec2 = trackEventMethodDecorator(trackingData), (_class2 = function TestClass() {
      (0, _classCallCheck3.default)(this, TestClass);

      _initDefineProp(this, 'handleTestEvent', _descriptor, this);

      this.props = { trackEvent: trackEvent };
    }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'handleTestEvent', [_dec2], {
      enumerable: true,
      initializer: function initializer() {
        return spyTestEvent;
      }
    })), _class2));


    var myTC = new TestClass();
    myTC.handleTestEvent('x');

    expect(trackingData).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith(dummyData);
    expect(spyTestEvent).toHaveBeenCalledWith('x');
  });
});