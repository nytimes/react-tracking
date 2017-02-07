'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mockDispatchTrackingEvent = jest.fn();
jest.setMock('../dispatchTrackingEvent', mockDispatchTrackingEvent);

describe('withTrackingComponentDecorator', function () {
  // eslint-disable-next-line global-require
  var withTrackingComponentDecorator = require('../withTrackingComponentDecorator').default;

  it('is a decorator (exports a function, that returns a function)', function () {
    expect(typeof withTrackingComponentDecorator === 'undefined' ? 'undefined' : (0, _typeof3.default)(withTrackingComponentDecorator)).toBe('function');

    var decorated = withTrackingComponentDecorator();
    expect(typeof decorated === 'undefined' ? 'undefined' : (0, _typeof3.default)(decorated)).toBe('function');
  });

  describe('with a function trackingContext', function () {
    var _dec, _class, _class2, _temp;

    var props = { props: 1 };
    var context = { context: 1 };
    var trackingContext = jest.fn(function () {});

    var TestComponent = (_dec = withTrackingComponentDecorator(trackingContext), _dec(_class = (_temp = _class2 = function TestComponent() {
      (0, _classCallCheck3.default)(this, TestComponent);
    }, _class2.displayName = 'TestComponent', _temp)) || _class);


    var myTC = new TestComponent(props, context);

    beforeEach(function () {
      mockDispatchTrackingEvent.mockClear();
    });

    it('defines the expected static properties', function () {
      expect(TestComponent.displayName).toBe('WithTracking(TestComponent)');
      expect(TestComponent.contextTypes.tracking).toBeDefined();
      expect(TestComponent.childContextTypes.tracking).toBeDefined();
    });

    it('calls trackingContext() in getChildContext', function () {
      expect(myTC.getChildContext()).toEqual({ tracking: {} });
      expect(trackingContext).toHaveBeenCalledTimes(1);
    });

    it('dispatches event in trackEvent', function () {
      var data = { data: 1 };
      myTC.trackEvent({ data: data });
      expect(mockDispatchTrackingEvent).toHaveBeenCalledWith({ data: data });
    });

    it('does not dispatch event in componentDidMount', function () {
      myTC.componentDidMount();
      expect(mockDispatchTrackingEvent).not.toHaveBeenCalled();
    });

    it('renders', function () {
      expect(myTC.render()).toBeDefined();
    });
  });

  describe('with an object trackingContext', function () {
    var _dec2, _class3, _class4, _temp2;

    var props = { props: 1 };
    var context = { context: 1 };
    var trackingContext = { page: 1 };

    var TestComponent = (_dec2 = withTrackingComponentDecorator(trackingContext), _dec2(_class3 = (_temp2 = _class4 = function TestComponent() {
      (0, _classCallCheck3.default)(this, TestComponent);
    }, _class4.displayName = 'TestComponent', _temp2)) || _class3);


    var myTC = new TestComponent(props, context);

    beforeEach(function () {
      mockDispatchTrackingEvent.mockClear();
    });

    // We'll only test what differs from the functional trackingContext variation

    it('returns the proper object in getChildContext', function () {
      expect(myTC.getChildContext()).toEqual({
        tracking: trackingContext
      });
    });

    it('dispatches event in componentDidMount', function () {
      myTC.componentDidMount();
      expect(mockDispatchTrackingEvent).toHaveBeenCalledWith({
        action: 'pageview',
        page: 1
      });
    });
  });
});