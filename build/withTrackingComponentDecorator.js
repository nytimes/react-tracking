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

function withTrackingComponentDecorator() {
    var trackingContext = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return function (DecoratedComponent) {
        var _class, _temp;

        var decoratedComponentName = DecoratedComponent.displayName || DecoratedComponent.name || 'Component';

        return _temp = _class = function (_Component) {
            (0, _inherits3.default)(WithTracking, _Component);

            function WithTracking(props) {
                (0, _classCallCheck3.default)(this, WithTracking);

                var _this = (0, _possibleConstructorReturn3.default)(this, (WithTracking.__proto__ || (0, _getPrototypeOf2.default)(WithTracking)).call(this, props));

                _this.trackEvent = _this.trackEvent.bind(_this);
                return _this;
            }

            (0, _createClass3.default)(WithTracking, [{
                key: 'getChildContext',
                value: function getChildContext() {
                    var thisTrackingContext = typeof trackingContext === 'function' ? trackingContext(this.props) : trackingContext;
                    return {
                        tracking: (0, _extends3.default)({}, this.context.tracking, thisTrackingContext)
                    };
                }
            }, {
                key: 'trackEvent',
                value: function trackEvent(data) {
                    (0, _dispatchTrackingEvent2.default)((0, _extends3.default)({}, this.getChildContext().tracking, data));
                }
            }, {
                key: 'componentDidMount',
                value: function componentDidMount() {
                    if (trackingContext.page) {
                        this.trackEvent({
                            action: 'pageview'
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
            tracking: _react.PropTypes.object
        }, _class.childContextTypes = {
            tracking: _react.PropTypes.object
        }, _temp;
    };
}