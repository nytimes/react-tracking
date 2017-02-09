const mockDispatchTrackingEvent = jest.fn();
jest.setMock('../dispatchTrackingEvent', mockDispatchTrackingEvent);

describe('withTrackingComponentDecorator', () => {
  // eslint-disable-next-line global-require
  const withTrackingComponentDecorator = require('../withTrackingComponentDecorator').default;

  it('is a decorator (exports a function, that returns a function)', () => {
    expect(typeof withTrackingComponentDecorator).toBe('function');

    const decorated = withTrackingComponentDecorator();
    expect(typeof decorated).toBe('function');
  });

  describe('with a function trackingContext', () => {
    const props = { props: 1 };
    const context = { context: 1 };
    const trackingContext = jest.fn(() => {});

    @withTrackingComponentDecorator(trackingContext)
    class TestComponent {
      static displayName = 'TestComponent';
    }

    const myTC = new TestComponent(props, context);

    beforeEach(() => {
      mockDispatchTrackingEvent.mockClear();
    });

    it('defines the expected static properties', () => {
      expect(TestComponent.displayName).toBe('WithTracking(TestComponent)');
      expect(TestComponent.contextTypes.tracking).toBeDefined();
      expect(TestComponent.childContextTypes.tracking).toBeDefined();
    });

    it('calls trackingContext() in getChildContext', () => {
      expect(myTC.getChildContext().tracking.data).toEqual({});
      expect(trackingContext).toHaveBeenCalledTimes(1);
    });

    it('dispatches event in trackEvent', () => {
      const data = { data: 1 };
      myTC.trackEvent({ data });
      expect(mockDispatchTrackingEvent).toHaveBeenCalledWith({ data });
    });

    it('does not dispatch event in componentDidMount', () => {
      myTC.componentDidMount();
      expect(mockDispatchTrackingEvent).not.toHaveBeenCalled();
    });

    it('renders', () => {
      expect(myTC.render()).toBeDefined();
    });
  });

  describe('with an object trackingContext', () => {
    const props = { props: 1 };
    const context = { context: 1 };
    const trackingContext = { page: 1 };

    @withTrackingComponentDecorator(trackingContext)
    class TestComponent {
      static displayName = 'TestComponent';
    }

    const myTC = new TestComponent(props, context);

    beforeEach(() => {
      mockDispatchTrackingEvent.mockClear();
    });

    // We'll only test what differs from the functional trackingContext variation

    it('returns the proper object in getChildContext', () => {
      expect(myTC.getChildContext().tracking).toEqual({
        data: trackingContext,
        dispatch: mockDispatchTrackingEvent,
      });
    });

    it('dispatches event in componentDidMount', () => {
      myTC.componentDidMount();
      expect(mockDispatchTrackingEvent).toHaveBeenCalledWith({
        event: 'pageDataReady',
        page: 1,
      });
    });
  });
});
