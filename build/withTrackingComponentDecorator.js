'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

exports.default = withTrackingComponentDecorator;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _dispatchTrackingEvent = require('./dispatchTrackingEvent');

var _dispatchTrackingEvent2 = _interopRequireDefault(_dispatchTrackingEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TrackingPropType = _react.PropTypes.shape({
  data: _react.PropTypes.object,
  dispatch: _react.PropTypes.func
});

function withTrackingComponentDecorator() {
  var trackingData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { dispatch: _dispatchTrackingEvent2.default };

  return function (DecoratedComponent) {
    var _class, _temp2;

    var decoratedComponentName = DecoratedComponent.displayName || DecoratedComponent.name || 'Component';

    return _temp2 = _class = function (_Component) {
      (0, _inherits3.default)(WithTracking, _Component);

      function WithTracking() {
        var _ref;

        var _temp, _this, _ret;

        (0, _classCallCheck3.default)(this, WithTracking);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = WithTracking.__proto__ || (0, _getPrototypeOf2.default)(WithTracking)).call.apply(_ref, [this].concat(args))), _this), _this.trackEvent = function (data) {
          _this.getTrackingDispatcher()((0, _extends3.default)({}, _this.getChildContext().tracking.data, data));
        }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
      }

      (0, _createClass3.default)(WithTracking, [{
        key: 'getTrackingDispatcher',
        value: function getTrackingDispatcher() {
          return this.context.tracking && this.context.tracking.dispatch || options.dispatch;
        }
      }, {
        key: 'getChildContext',
        value: function getChildContext() {
          var thisTrackingData = typeof trackingData === 'function' ? trackingData(this.props) : trackingData;

          var contextData = this.context.tracking && this.context.tracking.data || {};

          return {
            tracking: {
              data: (0, _extends3.default)({}, contextData, thisTrackingData),
              dispatch: this.getTrackingDispatcher()
            }
          };
        }
      }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
          if (trackingData.page) {
            this.trackEvent({
              event: 'pageDataReady'
            });
          }
        }
      }, {
        key: 'render',
        value: function render() {
          return _react2.default.createElement(DecoratedComponent, (0, _extends3.default)({}, this.props, {
            trackEvent: this.trackEvent
          }));
        }
      }]);
      return WithTracking;
    }(_react.Component), _class.displayName = 'WithTracking(' + decoratedComponentName + ')', _class.contextTypes = {
      tracking: TrackingPropType
    }, _class.childContextTypes = {
      tracking: TrackingPropType
    }, _temp2;
  };
}