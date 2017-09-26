describe('trackEventMethodDecorator', () => {
  // eslint-disable-next-line global-require
  const trackEventMethodDecorator = require('../trackEventMethodDecorator').default;

  it('is a decorator (exports a function, that returns a function)', () => {
    expect(typeof trackEventMethodDecorator).toBe('function');

    const decorated = trackEventMethodDecorator();
    expect(typeof decorated).toBe('function');
  });

  it('properly calls trackEvent when trackingData is a plain object', () => {
    const dummyData = {};
    const trackingData = dummyData;
    const trackEvent = jest.fn();
    const spyTestEvent = jest.fn();

    class TestClass {
      constructor() {
        this.props = {
          tracking: {
            trackEvent,
          },
        };
      }

      @trackEventMethodDecorator(trackingData)
      handleTestEvent(x) { // eslint-disable-line class-methods-use-this
        spyTestEvent(x);
      }
    }

    const myTC = new TestClass();
    myTC.handleTestEvent('x');

    expect(trackEvent).toHaveBeenCalledWith(dummyData);
    expect(spyTestEvent).toHaveBeenCalledWith('x');
  });

  it('properly calls trackEvent when trackingData is a function', () => {
    const dummyData = {};
    const trackingData = jest.fn(() => dummyData);
    const trackEvent = jest.fn();
    const spyTestEvent = jest.fn();

    class TestClass {
      constructor() {
        this.props = {
          tracking: {
            trackEvent,
          },
        };
      }

      @trackEventMethodDecorator(trackingData)
      handleTestEvent = spyTestEvent
    }

    const myTC = new TestClass();
    myTC.handleTestEvent('x');

    expect(trackingData).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith(dummyData);
    expect(spyTestEvent).toHaveBeenCalledWith('x');
  });

  it('properly passes through the correct arguments when trackingData is a function', () => {
    const dummyData = {};
    const trackingData = jest.fn(() => dummyData);
    const trackEvent = jest.fn();
    const spyTestEvent = jest.fn();
    const dummyArgument = 'x';

    class TestClass {
      constructor() {
        this.props = {
          tracking: {
            trackEvent,
          },
        };
        this.state = {
          myState: 'someState',
        };
      }

      @trackEventMethodDecorator(trackingData)
      handleTestEvent = spyTestEvent
    }

    const myTC = new TestClass();
    myTC.handleTestEvent(dummyArgument);

    // Access the trackingData arguments
    const trackingDataArguments = trackingData.mock.calls[0];

    expect(trackingData).toHaveBeenCalledTimes(1);
    expect(trackingDataArguments[0]).toEqual(myTC.props);
    expect(trackingDataArguments[1]).toEqual(myTC.state);
    // Here we have access to the raw `arguments` object, which is not an actual Array,
    // so in order to compare, we convert the arguments to an array.
    expect(Array.from(trackingDataArguments[2])).toEqual([dummyArgument]);

    expect(trackEvent).toHaveBeenCalledWith(dummyData);
    expect(spyTestEvent).toHaveBeenCalledWith(dummyArgument);
  });
});
