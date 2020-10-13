/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/destructuring-assignment,react/no-multi-comp,react/prop-types,react/prefer-stateless-function  */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useContext, useEffect, useState } from 'react';
import { mount } from 'enzyme';
// import PropTypes from 'prop-types';
// import hoistNonReactStatics from 'hoist-non-react-statics';

const dispatchTrackingEvent = jest.fn();
jest.setMock('../dispatchTrackingEvent', dispatchTrackingEvent);

const testDataContext = { testDataContext: true };
const testData = { testData: true };
const dispatch = jest.fn();
const testState = { booleanState: true };

describe.skip('hooks', () => {
  // eslint-disable-next-line global-require
  const { default: track, useTracking } = require('../');

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
      const { Track } = useTracking({}, { dispatchOnMount: true });

      return <Track>{null}</Track>; // TODO: what does it mean for the API if this was <Track dispatchOnMount /> instead of useTracking({ dispatchOnMount: true }) above?
    };

    mount(<TestPage />);

    expect(dispatchTrackingEvent).toHaveBeenCalledWith({
      ...testPageData,
    });
  });

  it('accepts a dispatch function in options', () => {
    const TestOptions = () => {
      const { trackEvent } = useTracking(testDataContext, { dispatch }); // TODO: should we accept top-level config options here?

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
      const { Track } = useTracking();

      return (
        <Track data={testDataContext} dispatch={dispatch}>
          {children}
        </Track>
      );
    };

    const TestChild = () => {
      useTracking(testChildData, { dispatchOnMount: true }); // TODO: Should these properties instead be on the <Track /> component and we require the user to "render" it?
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
      useTracking(testDispatchOnMount, { dispatch, dispatchOnMount }); // TODO: potential recipe here is if a component does not render children, it doesn't need to include <Track /> in the tree!
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
      useTracking({ page: 'Page' }); // TODO: Does this pass? It doesn't render children so we should still get all the proper tracking context dispatched on mount according to "process" fn above
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
    // TODO: Using purely hooks API, this test is redundant with above, but we will keep it for parity
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
      useTracking({ page: 'Page', runtimeData }); // TODO: in this case we were able to derive props.runtimeData "statically" from within the component, does this still work as expected?
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
      const Track = useTracking({ page: 'Page' });
      return <Track>{children}</Track>;
    };

    const Nested = ({ children }) => {
      const Track = useTracking({ view: 'View' });
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

    const TestOptions = ({ onProps, children }) => {
      const { Track } = useTracking({ onProps, ...testDataContext });
      return <Track>{children}</Track>;
    };

    const TestChild = () => {
      const { getTrackingData } = useTracking();
      mockReader(getTrackingData());
      return 'hi';
    };

    mount(
      <TestOptions onProps="yes">
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
    global.console.error = jest.fn();
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

    expect(global.console.error).toHaveBeenCalledTimes(1);
    expect(global.console.error).toHaveBeenCalledWith(
      '[react-tracking] options.process should be defined once on a top-level component'
    );
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

  it('does not cause unnecessary updates due to context changes', () => {
    let innerRenderCount = 0;

    const OuterComponent = track()(props => props.children);

    const MiddleComponent = track()(
      React.memo(
        props => props.children,
        (props, prevProps) => props.middleProp === prevProps.middleProp
      )
    );

    const InnerComponent = track()(() => {
      innerRenderCount += 1;
      return null;
    });

    const App = track()(() => {
      const [state, setState] = React.useState({});

      return (
        <div className="App">
          <h1>Extra renders of InnerComponent caused by new context API</h1>
          <button
            onClick={() => setState({ count: state.count + 1 })}
            type="button"
          >
            Update Props
          </button>
          <OuterComponent trackedProp={state}>
            <MiddleComponent middleProp={1}>
              <InnerComponent innerProps="a" />
            </MiddleComponent>
          </OuterComponent>
        </div>
      );
    });

    const wrapper = mount(<App />);

    wrapper.find('button').simulate('click');

    expect(innerRenderCount).toEqual(1);
  });

  // it('does not prevent components using the legacy context API and hoist-non-react-statics < v3.1.0 from receiving updates', () => {
  //   const withLegacyContext = DecoratedComponent => {
  //     class WithLegacyContext extends React.Component {
  //       static contextTypes = { theme: PropTypes.string };

  //       render() {
  //         return (
  //           <DecoratedComponent
  //             {...this.props} // eslint-disable-line react/jsx-props-no-spreading
  //             theme={this.context.theme}
  //           />
  //         );
  //       }
  //     }

  //     hoistNonReactStatics(WithLegacyContext, DecoratedComponent);

  //     // Explicitly hoist statc contextType to simulate behavior of
  //     // hoist-non-react-statics versions older than v3.1.0
  //     WithLegacyContext.contextType = DecoratedComponent.contextType;

  //     return WithLegacyContext;
  //   };

  //   @track()
  //   class Top extends React.Component {
  //     render() {
  //       return this.props.children;
  //     }
  //   }

  //   @withLegacyContext
  //   @track({ page: 'Page' }, { dispatchOnMount: true })
  //   class Page extends React.Component {
  //     render() {
  //       return <span>{this.props.theme}</span>;
  //     }
  //   }

  //   @track()
  //   class App extends React.Component {
  //     static childContextTypes = { theme: PropTypes.string };

  //     constructor(props) {
  //       super(props);
  //       this.state = { theme: 'light' };
  //     }

  //     getChildContext() {
  //       return { theme: this.state.theme };
  //     }

  //     handleUpdateTheme = () => {
  //       this.setState({ theme: 'dark' });
  //     };

  //     render() {
  //       return (
  //         <div>
  //           <button type="button" onClick={this.handleUpdateTheme} />
  //           <Top>
  //             <Page />
  //           </Top>
  //         </div>
  //       );
  //     }
  //   }

  //   const wrapper = mount(<App />);
  //   expect(wrapper.find('span').text()).toBe('light');

  //   wrapper.find('button').simulate('click');
  //   expect(wrapper.find('span').text()).toBe('dark');
  // });

  it('root context items are accessible to children', () => {
    const {
      ReactTrackingContext,
    } = require('../withTrackingComponentDecorator'); // eslint-disable-line global-require

    const App = track()(() => {
      return <Child />;
    });

    const Child = () => {
      const trackingContext = useContext(ReactTrackingContext);
      expect(Object.keys(trackingContext.tracking)).toEqual([
        'dispatch',
        'getTrackingData',
        'process',
      ]);
      return <div />;
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
    const message = { value: 'test' };

    let executeAction;
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

      executeAction = async () => {
        const data = await handleAsyncAction();
        setState({ data });
      };

      return <div>{state && state.data}</div>;
    };

    // Get the first child since the page is wrapped with the WithTracking component.
    const page = await mount(<Page />).childAt(0);
    await page.instance().executeAction(); // TODO: this probably doesn't work (how well does Enzyme support hooks?)
    // TODO: maybe have to just call executeAction(); here
    executeAction();

    expect(page.state().data).toEqual(message);
    expect(dispatchTrackingEvent).toHaveBeenCalledTimes(1);
    expect(dispatchTrackingEvent).toHaveBeenCalledWith({
      label: 'async action',
      status: 'success',
      ...message,
    });
  });

  it('handles rejected async function', async () => {
    const message = { value: 'error' };

    let executeAction;
    const Page = () => {
      const [state, setState] = useState({});
      const { trackEvent } = useTracking();

      const handleAsyncAction = () => {
        return Promise.reject(message);
      };

      executeAction = async () => {
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

      return <div>{state && state.data}</div>;
    };

    // Get the first child since the page is wrapped with the WithTracking component.
    const page = await mount(<Page />).childAt(0);
    await page.instance().executeAction();
    // TODO: redundant with previous test perhaps, but here for posterity. Similarly we may need to call executeAction(); directly
    executeAction();

    expect(page.state().data).toEqual(message);
    expect(dispatchTrackingEvent).toHaveBeenCalledTimes(1);
    expect(dispatchTrackingEvent).toHaveBeenCalledWith({
      label: 'async action',
      status: 'failed',
    });
  });

  it('can access wrapped component by ref', async () => {
    const focusFn = jest.fn();

    const Child = React.forwardRef((props, ref) => {
      const { Track } = useTracking({});

      return (
        <Track>
          <button ref={ref} onFocus={focusFn} type="button">
            child
          </button>
        </Track>
      );
    });

    const ref = React.createRef();
    const Parent = () => {
      useEffect(() => {
        ref.current.focus();
      }, []);

      return <Child ref={ref} />;
    };

    const parent = await mount(<Parent />);

    expect(parent.instance().child).not.toBeNull(); // TODO: probably need to rethink how this test works
    expect(focusFn).toHaveBeenCalledTimes(1);
  });
});
