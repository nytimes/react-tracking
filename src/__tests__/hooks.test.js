/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/destructuring-assignment,react/no-multi-comp,react/prop-types,react/prefer-stateless-function  */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useContext, useEffect, useState } from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

const dispatchTrackingEvent = jest.fn();
jest.setMock('../dispatchTrackingEvent', dispatchTrackingEvent);

const testDataContext = { testDataContext: true };
const testData = { testData: true };
const dispatch = jest.fn();
const testState = { booleanState: true };

describe('hooks', () => {
  // eslint-disable-next-line global-require
  const { default: track, useTracking } = require('..');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('defaults mostly everything', () => {
    const TestDefaults = ({ children }) => {
      const { Track } = useTracking({}, { process: () => null });

      return <Track>{children}</Track>;
    };

    const Child = () => {
      const { trackEvent } = useTracking();

      useEffect(() => {
        trackEvent({ test: true });
      }, [trackEvent]);

      return 'hi';
    };

    mount(
      <TestDefaults>
        <Child />
      </TestDefaults>
    );

    expect(dispatchTrackingEvent).toHaveBeenCalledTimes(1);
    expect(dispatchTrackingEvent).toHaveBeenCalledWith({ test: true });
  });

  it('defaults to dispatchTrackingEvent when no dispatch function passed in to options', () => {
    const testPageData = { page: 'TestPage' };

    const TestPage = () => {
      useTracking(testPageData, { dispatchOnMount: true });
      return null;
    };

    mount(<TestPage />);

    expect(dispatchTrackingEvent).toHaveBeenCalledWith({
      ...testPageData,
    });
  });

  it('accepts a dispatch function in options', () => {
    const TestOptions = () => {
      const { trackEvent } = useTracking(testDataContext, { dispatch });

      const blah = () => {
        trackEvent(testData);
      };

      blah();
      return <div />;
    };

    mount(<TestOptions />);

    expect(dispatchTrackingEvent).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      ...testDataContext,
      ...testData,
    });
  });

  it('will use dispatch fn passed in from further up in context', () => {
    const testChildData = { page: 'TestChild' };

    const TestOptions = ({ children }) => {
      const { Track } = useTracking(testDataContext, { dispatch });

      return <Track>{children}</Track>;
    };

    const TestChild = () => {
      useTracking(testChildData, { dispatchOnMount: true });
      return <div />;
    };

    mount(
      <TestOptions>
        <TestChild />
      </TestOptions>
    );

    expect(dispatch).toHaveBeenCalledWith({
      ...testDataContext,
      ...testChildData,
    });
  });

  it('will deep-merge tracking data', () => {
    const mockDispatchTrackingEvent = jest.fn();
    const testData1 = { key: { x: 1, y: 1 } };
    const testData2 = { key: { x: 2, z: 2 }, page: 'TestDeepMerge' };

    const TestData1 = ({ children }) => {
      const { Track } = useTracking(testData1, {
        dispatch: mockDispatchTrackingEvent,
      });
      return <Track>{children}</Track>;
    };

    const TestData3 = () => {
      const { Track } = useTracking(
        { key: { x: 3, y: 3 } },
        { dispatchOnMount: true }
      );

      return (
        <Track>
          <div />
        </Track>
      );
    };

    const TestData2 = () => {
      const { Track } = useTracking(testData2);

      return (
        <Track>
          <TestData3 />
        </Track>
      );
    };

    mount(
      <TestData1>
        <TestData2 />
      </TestData1>
    );

    expect(mockDispatchTrackingEvent).toHaveBeenCalledWith({
      page: 'TestDeepMerge',
      key: { x: 3, y: 3, z: 2 },
    });
  });

  it('will call dispatchOnMount as a function', () => {
    const testDispatchOnMount = { test: true };
    const dispatchOnMount = jest.fn(() => ({ dom: true }));

    const TestComponent = () => {
      useTracking(testDispatchOnMount, { dispatch, dispatchOnMount });
      return null;
    };

    mount(<TestComponent />);

    expect(dispatchOnMount).toHaveBeenCalledWith(testDispatchOnMount);
    expect(dispatch).toHaveBeenCalledWith({ dom: true, test: true });
  });

  it('will dispatch a pageview event on mount on class component', () => {
    const App = ({ children }) => {
      const { Track } = useTracking(
        { topLevel: true },
        {
          dispatch,
          process: data => {
            if (data.page) {
              return { event: 'pageView' };
            }
            return null;
          },
        }
      );

      return <Track>{children}</Track>;
    };

    const Page = () => {
      useTracking({ page: 'Page' });
      return <div>Page</div>;
    };

    mount(
      <App>
        <Page />
      </App>
    );

    expect(dispatch).toHaveBeenCalledWith({
      topLevel: true,
      event: 'pageView',
      page: 'Page',
    });
  });

  it('will dispatch a pageview event on mount on functional component', () => {
    const App = ({ children }) => {
      const { Track } = useTracking(
        { topLevel: true },
        {
          dispatch,
          process: data => {
            if (data.page) {
              return { event: 'pageView' };
            }
            return null;
          },
        }
      );

      return <Track>{children}</Track>;
    };

    const Page = () => {
      useTracking({ page: 'Page' });
      return <div>Page</div>;
    };

    mount(
      <App>
        <Page />
      </App>
    );

    expect(dispatch).toHaveBeenCalledWith({
      topLevel: true,
      event: 'pageView',
      page: 'Page',
    });
  });

  it("should not dispatch a pageview event on mount if there's no page property on tracking object", () => {
    const App = ({ children }) => {
      const { Track } = useTracking(
        { topLevel: true },
        {
          dispatch,
          process: () => null,
        }
      );

      return <Track>{children}</Track>;
    };

    const Page = () => {
      useTracking({ page: 'Page' });
      return <div>Page</div>;
    };

    mount(
      <App>
        <Page />
      </App>
    );

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should not dispatch a pageview event on mount if proccess returns falsy value', () => {
    const App = ({ children }) => {
      const { Track } = useTracking(
        { topLevel: true },
        {
          dispatch,
          process: data => {
            if (data.page) {
              return { event: 'pageView' };
            }
            return false;
          },
        }
      );

      return <Track>{children}</Track>;
    };

    const Page = () => {
      useTracking({});
      return <div>Page</div>;
    };

    mount(
      <App>
        <Page />
      </App>
    );

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('will dispatch a top level pageview event on every page and component specific event on mount', () => {
    const App = ({ children }) => {
      const { Track } = useTracking(
        { topLevel: true },
        {
          dispatch,
          process: data => {
            if (data.page) {
              return { event: 'pageView' };
            }
            return null;
          },
        }
      );

      return <Track>{children}</Track>;
    };

    const Page1 = () => {
      useTracking({ page: 'Page1' });
      return <div>Page</div>;
    };

    const Page2 = () => {
      useTracking(
        { page: 'Page2' },
        { dispatchOnMount: () => ({ page2specific: true }) }
      );
      return <div>Page</div>;
    };

    mount(
      <App>
        <Page1 />
        <Page2 />
      </App>
    );

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenCalledWith({
      page: 'Page1',
      event: 'pageView',
      topLevel: true,
    });
    expect(dispatch).toHaveBeenCalledWith({
      page: 'Page2',
      event: 'pageView',
      topLevel: true,
      page2specific: true,
    });
  });

  it('process works with trackingData as a function', () => {
    const App = ({ children }) => {
      const { Track } = useTracking(
        { topLevel: true },
        {
          dispatch,
          process: data => {
            if (data.page) {
              return { event: 'pageView' };
            }
            return null;
          },
        }
      );

      return <Track>{children}</Track>;
    };

    const Page = ({ runtimeData }) => {
      useTracking({ page: 'Page', runtimeData });
      return <div>Page</div>;
    };

    mount(
      <App>
        <Page runtimeData />
      </App>
    );

    expect(dispatch).toHaveBeenCalledWith({
      event: 'pageView',
      page: 'Page',
      runtimeData: true,
      topLevel: true,
    });
  });

  it("doesn't dispatch pageview for nested components without page tracking data", () => {
    const App = ({ children }) => {
      const { Track } = useTracking(
        { topLevel: true },
        {
          dispatch,
          process: data => {
            if (data.page) {
              return { event: 'pageView' };
            }
            return null;
          },
        }
      );

      return <Track>{children}</Track>;
    };
    const Page = ({ children }) => {
      const { Track } = useTracking({ page: 'Page' });
      return <Track>{children}</Track>;
    };

    const Nested = ({ children }) => {
      const { Track } = useTracking({ view: 'View' });
      return <Track>{children}</Track>;
    };

    const Button = () => {
      const { trackEvent } = useTracking({ region: 'Button' });

      const handleClick = () => {
        trackEvent({ event: 'buttonClick' });
      };

      return (
        <button type="button" onClick={handleClick}>
          Click me!
        </button>
      );
    };

    const wrappedApp = mount(
      <App>
        <Page>
          <Nested>
            <Button />
          </Nested>
        </Page>
      </App>
    );

    wrappedApp.find('Button').simulate('click');

    expect(dispatch).toHaveBeenCalledWith({
      event: 'pageView',
      page: 'Page',
      topLevel: true,
    });
    expect(dispatch).toHaveBeenCalledWith({
      event: 'buttonClick',
      page: 'Page',
      region: 'Button',
      view: 'View',
      topLevel: true,
    });
    expect(dispatch).toHaveBeenCalledTimes(2); // pageview event and simulated button click
  });

  it('dispatches state data when components contain state', () => {
    const TestOptions = () => {
      const [booleanState] = useState(true);
      const { trackEvent } = useTracking(testDataContext, { dispatch });

      const exampleMethod = () => {
        trackEvent({ booleanState });
      };

      exampleMethod();
      return <div />;
    };

    mount(<TestOptions />);

    expect(dispatchTrackingEvent).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      ...testDataContext,
      ...testState,
    });
  });

  it('can read tracking data from props.tracking.getTrackingData()', () => {
    const mockReader = jest.fn();

    const TestOptions = ({ onProps, child, children }) => {
      const { Track } = useTracking({ onProps, child, ...testDataContext });
      return <Track>{children}</Track>;
    };

    const TestChild = () => {
      const { getTrackingData } = useTracking();
      mockReader(getTrackingData());
      return 'hi';
    };

    mount(
      <TestOptions onProps="yes" child>
        <TestChild />
      </TestOptions>
    );

    expect(mockReader).toHaveBeenCalledTimes(1);
    expect(mockReader).toHaveBeenCalledWith({
      child: true,
      onProps: 'yes',
      ...testDataContext,
    });

    expect(dispatchTrackingEvent).not.toHaveBeenCalled();
  });

  it('logs a console error when there is already a process defined on context', () => {
    const consoleError = jest
      .spyOn(global.console, 'error')
      .mockImplementation(() => {});
    const process = () => {};

    const NestedComponent = () => {
      const { Track } = useTracking({}, { process });
      return (
        <Track>
          <div />
        </Track>
      );
    };

    const Intermediate = () => (
      <div>
        <NestedComponent />
      </div>
    );

    const TestComponent = () => {
      const { Track } = useTracking({}, { process });
      return (
        <Track>
          <div>
            <Intermediate />
          </div>
        </Track>
      );
    };

    mount(<TestComponent />);

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith(
      '[react-tracking] options.process should be defined once on a top-level component'
    );

    consoleError.mockRestore();
  });

  it('will dispatch different data if props changed', () => {
    const Top = ({ data, children }) => {
      const { Track } = useTracking(() => ({ data }));
      return <Track>{children}</Track>;
    };

    const Page = () => {
      const { Track, trackEvent } = useTracking({ page: 'Page' });

      const handleClick = () => {
        trackEvent({ event: 'buttonClick' });
      };

      return (
        <Track>
          <span onClick={handleClick}>Click Me</span>
        </Track>
      );
    };

    const App = () => {
      const [state, setState] = useState({ data: 1 });
      const { Track } = useTracking({}, { dispatch });

      return (
        <Track>
          <div>
            <button type="button" onClick={() => setState({ data: 2 })} />
            <Top data={state.data}>
              <Page />
            </Top>
          </div>
        </Track>
      );
    };

    const wrappedApp = mount(<App />);

    wrappedApp.find('span').simulate('click');
    expect(dispatch).toHaveBeenCalledWith({
      data: 1,
      event: 'buttonClick',
      page: 'Page',
    });

    wrappedApp.find('button').simulate('click');
    wrappedApp.find('span').simulate('click');
    expect(dispatch).toHaveBeenCalledWith({
      data: 2,
      event: 'buttonClick',
      page: 'Page',
    });
  });

  it('provides passed in tracking data immediately', () => {
    const Foo = () => {
      const { getTrackingData } = useTracking({ seeMe: true });

      expect(getTrackingData()).toStrictEqual({ seeMe: true });

      return null;
    };

    mount(<Foo />);
  });

  it('does not cause unnecessary updates due to context changes', () => {
    let innerRenderCount = 0;
    let getLatestTrackingData;

    const OuterComponent = ({ children, trackedProp }) => {
      const { Track } = useTracking({ trackedProp });
      return <Track>{children}</Track>;
    };

    const MiddleComponent = React.memo(
      ({ children, middleProp }) => {
        const { Track } = useTracking({ middleProp });
        return <Track>{children}</Track>;
      },
      (props, prevProps) => props.middleProp === prevProps.middleProp
    );

    const InnerComponent = ({ innerProps }) => {
      const { Track, getTrackingData } = useTracking({ innerProps });
      innerRenderCount += 1;

      // expose for test assertion later
      getLatestTrackingData = getTrackingData;

      return <Track>{innerProps}</Track>;
    };

    const App = () => {
      const [count, setCount] = useState(0);

      const { Track } = useTracking({ count });

      return (
        <Track>
          <div className="App">
            <h1>Extra renders of InnerComponent caused by new context API</h1>
            <button
              onClick={() => {
                setCount(c => c + 1);
              }}
              type="button"
            >
              Update Props
            </button>
            <OuterComponent trackedProp={count}>
              <MiddleComponent middleProp="middleProp">
                <InnerComponent innerProps="a" />
              </MiddleComponent>
            </OuterComponent>
          </div>
        </Track>
      );
    };

    const wrapper = mount(<App />);

    wrapper.find('button').simulate('click');
    wrapper.find('button').simulate('click');

    expect(getLatestTrackingData()).toStrictEqual({
      count: 2,
      trackedProp: 2,
      middleProp: 'middleProp',
      innerProps: 'a',
    });

    expect(innerRenderCount).toEqual(1);
  });

  it('does not cause unnecessary dispatches due to object literals passed to useTracking', () => {
    const trackRenders = jest.fn();

    const App = () => {
      // eslint-disable-next-line no-unused-vars
      const [clickCount, setClickCount] = useState(0);

      useEffect(() => {
        // use mock function to ensure that we are counting renders, not clicks
        trackRenders();
      });

      useTracking(
        {},
        {
          dispatch,
          dispatchOnMount: () => {
            return { test: true };
          },
        }
      );

      return (
        <div className="App">
          <h1>
            Extra dispatches caused by new object literals passed on re-render
          </h1>
          <button onClick={() => setClickCount(c => c + 1)} type="button">
            Update trackingData and options objects
          </button>
        </div>
      );
    };

    const wrapper = mount(<App />);

    const button = wrapper.find('button');
    button.simulate('click');
    button.simulate('click');
    button.simulate('click');

    expect(trackRenders).toHaveBeenCalledTimes(4);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenLastCalledWith({
      test: true,
    });
  });

  it('dispatches the correct data if props change', () => {
    const App = props => {
      const { trackEvent } = useTracking(
        { data: props.data || '' },
        {
          dispatch,
          dispatchOnMount: true,
        }
      );

      const handleClick = () => {
        trackEvent({ event: 'click' });
      };

      return (
        <div className="App">
          <button onClick={handleClick} type="button" />
        </div>
      );
    };

    const wrapper = mount(<App />);

    expect(dispatch).toHaveBeenCalledWith({ data: '' });

    wrapper.setProps({ data: 'Updated data prop' });
    wrapper.find('button').simulate('click');

    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenLastCalledWith({
      event: 'click',
      data: 'Updated data prop',
    });
  });

  it('can interop with the HoC (where HoC is top-level)', () => {
    const mockDispatchTrackingEvent = jest.fn();
    const testData1 = { key: { x: 1, y: 1 }, topLevel: 'hoc' };
    const testData2 = { key: { x: 2, z: 2 }, page: 'TestDeepMerge' };

    // functional wrapper hoc
    const TestData1 = track(testData1, { dispatch: mockDispatchTrackingEvent })(
      ({ children }) => children
    );

    // hook nested
    const TestData3 = () => {
      const { Track } = useTracking(
        { key: { x: 3, y: 3 } },
        { dispatchOnMount: true }
      );

      return (
        <Track>
          <div />
        </Track>
      );
    };

    // hook nested
    const TestData2 = () => {
      const { Track } = useTracking(testData2);

      return (
        <Track>
          <TestData3 />
        </Track>
      );
    };

    mount(
      <TestData1>
        <TestData2 />
      </TestData1>
    );

    expect(mockDispatchTrackingEvent).toHaveBeenCalledWith({
      topLevel: 'hoc',
      page: 'TestDeepMerge',
      key: { x: 3, y: 3, z: 2 },
    });
  });

  it('can interop with HoC (where Hook is top-level)', () => {
    const mockDispatchTrackingEvent = jest.fn();
    const testData1 = { key: { x: 1, y: 1 }, topLevel: 'hook' };
    const testData2 = { key: { x: 2, z: 2 }, page: 'TestDeepMerge' };

    // hook top-level
    const TestData1 = ({ children }) => {
      const { Track } = useTracking(testData1, {
        dispatch: mockDispatchTrackingEvent,
      });
      return <Track>{children}</Track>;
    };

    // functional wrapper hoc
    const TestData3 = track(
      { key: { x: 3, y: 3 } },
      { dispatchOnMount: true }
    )(() => <div />);

    // decorator hoc
    @track(testData2)
    class TestData2 extends React.Component {
      render() {
        return <TestData3 />;
      }
    }

    mount(
      <TestData1>
        <TestData2 />
      </TestData1>
    );

    expect(mockDispatchTrackingEvent).toHaveBeenCalledWith({
      topLevel: 'hook',
      page: 'TestDeepMerge',
      key: { x: 3, y: 3, z: 2 },
    });
  });

  it('root context items are accessible to children', () => {
    const ReactTrackingContext = require('../ReactTrackingContext').default; // eslint-disable-line global-require

    const Child = () => {
      const trackingContext = useContext(ReactTrackingContext);
      expect(Object.keys(trackingContext.tracking)).toEqual([
        'dispatch',
        'getTrackingData',
        'process',
      ]);
      return <div />;
    };

    const App = () => {
      const { Track } = useTracking();

      return (
        <Track>
          <Child />
        </Track>
      );
    };

    mount(<App />);
  });

  it('dispatches tracking events from a useTracking hook tracking object', () => {
    const outerTrackingData = {
      page: 'Page',
    };

    const Page = track(outerTrackingData, { dispatch })(props => {
      return props.children;
    });

    const Child = () => {
      const tracking = useTracking();

      expect(tracking.getTrackingData()).toEqual(outerTrackingData);

      return (
        <button
          type="button"
          onClick={() => {
            tracking.trackEvent({ event: 'buttonClick' });
          }}
        />
      );
    };

    const wrappedApp = mount(
      <Page>
        <Child />
      </Page>
    );

    wrappedApp.find('button').simulate('click');

    expect(dispatch).toHaveBeenCalledWith({
      ...outerTrackingData,
      event: 'buttonClick',
    });
  });

  it('dispatches tracking event from async function', async () => {
    const message = 'test';

    const Page = () => {
      const [state, setState] = useState({});
      const { trackEvent } = useTracking();

      const handleAsyncAction = async () => {
        const value = await Promise.resolve(message);
        trackEvent({
          label: 'async action',
          status: 'success',
          value,
        });

        return value;
      };

      const executeAction = async () => {
        const data = await handleAsyncAction();
        setState({ data });
      };

      return (
        <>
          <button type="button" onClick={executeAction} />
          <div>{state && state.data}</div>
        </>
      );
    };

    const page = await mount(<Page />);
    await act(async () => {
      await page.find('button').simulate('click');
    });

    expect(page.text()).toEqual(message);
    expect(dispatchTrackingEvent).toHaveBeenCalledTimes(1);
    expect(dispatchTrackingEvent).toHaveBeenCalledWith({
      label: 'async action',
      status: 'success',
      value: message,
    });
  });

  it('handles rejected async function', async () => {
    const message = 'error';

    const Page = () => {
      const [state, setState] = useState({});
      const { trackEvent } = useTracking();

      const handleAsyncAction = () => {
        return Promise.reject(message);
      };

      const executeAction = async () => {
        try {
          const data = await handleAsyncAction();
          setState({ data });
        } catch (error) {
          setState({ data: error });

          trackEvent({
            label: 'async action',
            status: 'failed',
          });
        }
      };

      return (
        <>
          <button type="button" onClick={executeAction} />
          <div>{state && state.data}</div>
        </>
      );
    };

    const page = await mount(<Page />);
    await act(async () => {
      await page.find('button').simulate('click');
    });

    expect(page.text()).toEqual(message);
    expect(dispatchTrackingEvent).toHaveBeenCalledTimes(1);
    expect(dispatchTrackingEvent).toHaveBeenCalledWith({
      label: 'async action',
      status: 'failed',
    });
  });
});
