'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty = require('babel-runtime/core-js/reflect/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _apply = require('babel-runtime/core-js/reflect/apply');

var _apply2 = _interopRequireDefault(_apply);

exports.default = makeClassMemberDecorator;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Helper to decorate class member
 * Supports class plain methods, field syntax and lazy methods
 * @param {Function} decorate Actual decorator function.
 * Example:
 *   decoratedFn => function () {
 *     // do stuff...
 *     return Reflect.apply(decoratedFn, this, arguments);
 *   }
 * @returns {Function} Class member decorator ((target, name, descriptor) => newDescriptor)
 */
function makeClassMemberDecorator(decorate) {
  return function decorateClassMember(target, name, descriptor) {
    var configurable = descriptor.configurable,
        enumerable = descriptor.enumerable,
        value = descriptor.value,
        _get = descriptor.get,
        initializer = descriptor.initializer;


    if (value) {
      return {
        configurable: configurable,
        enumerable: enumerable,
        value: decorate(value)
      };
    }

    // support lazy initializer
    if (_get || initializer) {
      return {
        configurable: configurable,
        enumerable: enumerable,
        get: function get() {
          // This happens if someone accesses the
          // property directly on the prototype
          if (this === target) {
            return null;
          }

          var resolvedValue = initializer ? (0, _apply2.default)(initializer, this, []) : (0, _apply2.default)(_get, this, []);
          var decoratedValue = decorate(resolvedValue).bind(this);

          (0, _defineProperty2.default)(this, name, {
            configurable: configurable,
            enumerable: enumerable,
            value: decoratedValue
          });

          return decoratedValue;
        }
      };
    }

    throw new Error('called makeClassMemberDecorator on unsupported descriptor');
  };
}