'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TrackingPropType = undefined;

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require('lodash.merge');

var _lodash2 = _interopRequireDefault(_lodash);

var _dispatchTrackingEvent = require('./dispatchTrackingEvent');

var _dispatchTrackingEvent2 = _interopRequireDefault(_dispatchTrackingEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TrackingPropType = exports.TrackingPropType = _propTypes2.default.shape({
  data: _propTypes2.default.object,
  dispatch: _propTypes2.default.func,
  process: _propTypes2.default.func
});

function withTrackingComponentDecorator() {
  var trackingData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$dispatch = _ref.dispatch,
      dispatch = _ref$dispatch === undefined ? _dispatchTrackingEvent2.default : _ref$dispatch,
      _ref$dispatchOnMount = _ref.dispatchOnMount,
      dispatchOnMount = _ref$dispatchOnMount === undefined ? false : _ref$dispatchOnMount,
      process = _ref.process;

  return function (DecoratedComponent) {
    var _class, _temp;

    var decoratedComponentName = DecoratedComponent.displayName || DecoratedComponent.name || 'Component';

    return _temp = _class = function (_Component) {
      (0, _inherits3.default)(WithTracking, _Component);

      function WithTracking(props, context) {
        (0, _classCallCheck3.default)(this, WithTracking);

        var _this = (0, _possibleConstructorReturn3.default)(this, (WithTracking.__proto__ || (0, _getPrototypeOf2.default)(WithTracking)).call(this, props, context));

        _this.trackEvent = function (data) {
          _this.getTrackingDispatcher()(
          // deep-merge tracking data from context and tracking data passed in here
          (0, _lodash2.default)({}, _this.trackingData, data));
        };

        _this.tracking = {
          trackEvent: _this.trackEvent,
          getTrackingData: function getTrackingData() {
            return _this.trackingData;
          }
        };


        if (context.tracking && context.tracking.process && process) {
          console.error('[react-tracking] options.process should be used once on top level component');
        }

        _this.ownTrackingData = typeof trackingData === 'function' ? trackingData(props) : trackingData;
        _this.contextTrackingData = _this.context.tracking && _this.context.tracking.data || {};
        _this.trackingData = (0, _lodash2.default)({}, _this.contextTrackingData, _this.ownTrackingData);
        return _this;
      }

      (0, _createClass3.default)(WithTracking, [{
        key: 'getTrackingDispatcher',
        value: function getTrackingDispatcher() {
          return this.context.tracking && this.context.tracking.dispatch || dispatch;
        }
      }, {
        key: 'getChildContext',
        value: function getChildContext() {
          return {
            tracking: {
              data: (0, _lodash2.default)({}, this.contextTrackingData, this.ownTrackingData),
              dispatch: this.getTrackingDispatcher(),
              process: this.context.tracking && this.context.tracking.process || process
            }
          };
        }
      }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
          var contextProcess = this.context.tracking && this.context.tracking.process;

          if (typeof contextProcess === 'function' && typeof dispatchOnMount === 'function') {
            this.trackEvent((0, _lodash2.default)({}, contextProcess(this.ownTrackingData), dispatchOnMount(this.trackingData)));
          } else if (typeof contextProcess === 'function') {
            var processed = contextProcess(this.ownTrackingData);
            if (processed) {
              this.trackEvent(processed);
            }
          } else if (typeof dispatchOnMount === 'function') {
            this.trackEvent(dispatchOnMount(this.trackingData));
          } else if (dispatchOnMount === true) {
            this.trackEvent();
          }
        }
      }, {
        key: 'render',
        value: function render() {
          return _react2.default.createElement(DecoratedComponent, (0, _extends3.default)({}, this.props, {
            tracking: this.tracking
          }));
        }
      }]);
      return WithTracking;
    }(_react.Component), _class.displayName = 'WithTracking(' + decoratedComponentName + ')', _class.contextTypes = {
      tracking: TrackingPropType
    }, _class.childContextTypes = {
      tracking: TrackingPropType
    }, _temp;
  };
}