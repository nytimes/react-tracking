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

var _makeClassMemberDecorator = require('../makeClassMemberDecorator');

var _makeClassMemberDecorator2 = _interopRequireDefault(_makeClassMemberDecorator);

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

describe('makeClassMemberDecorator', function () {
  it('is a decorator (exports a function, that returns a function)', function () {
    expect(typeof _makeClassMemberDecorator2.default === 'undefined' ? 'undefined' : (0, _typeof3.default)(_makeClassMemberDecorator2.default)).toBe('function');

    var decorated = (0, _makeClassMemberDecorator2.default)();
    expect(typeof decorated === 'undefined' ? 'undefined' : (0, _typeof3.default)(decorated)).toBe('function');
  });

  it('properly decorates class methods', function () {
    var _dec, _desc, _value, _class;

    var mockDecorator = jest.fn(function (x) {
      return x;
    });
    var thingSpy = jest.fn();
    var Test = (_dec = (0, _makeClassMemberDecorator2.default)(mockDecorator), (_class = function () {
      function Test() {
        (0, _classCallCheck3.default)(this, Test);
      }

      (0, _createClass3.default)(Test, [{
        key: 'thing',
        value: function thing() {
          // eslint-disable-line class-methods-use-this
          thingSpy();
        }
      }]);
      return Test;
    }(), (_applyDecoratedDescriptor(_class.prototype, 'thing', [_dec], (0, _getOwnPropertyDescriptor2.default)(_class.prototype, 'thing'), _class.prototype)), _class));

    var myTest = new Test();

    expect(thingSpy).not.toHaveBeenCalled();
    myTest.thing();
    expect(mockDecorator).toHaveBeenCalledTimes(1);
    expect(thingSpy).toHaveBeenCalledTimes(1);
  });

  it('properly decorates field syntax', function () {
    var _dec2, _desc2, _value2, _class2, _descriptor;

    var mockDecorator = jest.fn(function (x) {
      return x;
    });
    var fieldSpy = jest.fn();
    var Test = (_dec2 = (0, _makeClassMemberDecorator2.default)(mockDecorator), (_class2 = function Test() {
      (0, _classCallCheck3.default)(this, Test);

      _initDefineProp(this, 'field', _descriptor, this);
    }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'field', [_dec2], {
      enumerable: true,
      initializer: function initializer() {
        return fieldSpy;
      }
    })), _class2));

    var myTest = new Test();

    expect(fieldSpy).not.toHaveBeenCalled();
    expect(mockDecorator).not.toHaveBeenCalled();
    myTest.field();
    expect(mockDecorator).toHaveBeenCalledTimes(1);
    expect(fieldSpy).toHaveBeenCalledTimes(1);
  });

  it('throws when called on unsupported descriptor', function () {
    expect(function () {
      return (0, _makeClassMemberDecorator2.default)()(null, null, {});
    }).toThrow();
  });
});