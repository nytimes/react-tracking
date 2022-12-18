// @ts-check
/* eslint-disable react/destructuring-assignment,react/no-multi-comp,react/prop-types,react/prefer-stateless-function  */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable global-require */
import React, { useContext } from 'react';
import { mount } from 'enzyme';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

const dispatchTrackingEvent = jest.fn();
window.dataLayer = [];
window.dataLayer.push = dispatchTrackingEvent;

const testDataContext = { testDataContext: true };
const testData = { testData: true };
const dispatch = jest.fn();
const testState = { booleanState: true };

const runTests = useBuiltLib => {
  const { default: track, useTracking } = useBuiltLib
    ? require('../../build')
    : require('..');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('defaults mostly everything', () => {
    @track(null, { process: () => null })
    class TestDefaults extends React.Component {
      render() {
        return this.props.children;
      }
    }

    @track()
    class Child extends React.Component {
      componentDidMount() {
        this.props.tracking.trackEvent({ test: true });
      }

      render() {
        return 'hi';
      }
    }

    mount(
      <TestDefaults>
        <Child />
      </TestDefaults>
    );

    expect(dispatchTrackingEvent).toHaveBeenCalledTimes(1);
    expect(dispatchTrackingEvent).toHaveBeenCalledWith({ test: true });
  });

  it('allows tracking errors', () => {
    @track(null, {
      mergeOptions: {
        isMergeableObject: obj => !(obj instanceof Error),
      },
    })
    class TestPage extends React.Component {
      componentDidMount() {
        this.props.tracking.trackEvent({ test: new Error('my crazy error') });
      }

      render() {
        return 'hi';
      }
    }

    mount(<TestPage />);

    expect(dispatchTrackingEvent).toHaveBeenCalledTimes(1);
    expect(dispatchTrackingEvent).toHaveBeenCalledWith({
      test: new Error('my crazy error'),
    });
  });

  it('defaults to dispatchTrackingEvent when no dispatch function passed in to options', () => {
    const testPageData = { page: 'TestPage' };

    @track(testPageData, { dispatchOnMount: true })
    class TestPage extends React.Component {
      render() {
        return null;
      }
    }

    mount(<TestPage />);

    expect(dispatchTrackingEvent).toHaveBeenCalledWith({
      ...testPageData,
    });
  });

  it('accepts a dispatch function in options', () => {
    @track(testDataContext, { dispatch })
    class TestOptions extends React.Component {
      @track(testData)
      blah = () => {};

      render() {
        this.blah();
        return <div />;
      }
    }

    mount(<TestOptions />);

    expect(dispatchTrackingEvent).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      ...testDataContext,
      ...testData,
    });
  });

  it('will use dispatch fn passed in from further up in context', () => {
    const testChildData = { page: 'TestChild' };

    @track(testDataContext, { dispatch })
    class TestOptions extends React.Component {
      render() {
        return this.props.children;
      }
    }

    @track(testChildData, { dispatchOnMount: true })
    class TestChild extends React.Component {
      render() {
        return <div />;
      }
    }

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
    const testData1 = { key: { x: 1, y: 1 } };
    const testData2 = { key: { x: 2, z: 2 }, page: 'TestDeepMerge' };

    @track(testData1)
    class TestData1 extends React.Component {
      render() {
        return this.props.children;
      }
    }

    const TestData3 = track(
      { key: { x: 3, y: 3 } },
      { dispatchOnMount: true }
    )(() => <div />);

    const TestData2 = track(testData2)(() => <TestData3 />);

    mount(
      <TestData1>
        <TestData2 />
      </TestData1>
    );

    expect(dispatchTrackingEvent).toHaveBeenCalledWith({
      page: 'TestDeepMerge',
      key: { x: 3, y: 3, z: 2 },
    });
  });

  it('will call dispatchOnMount as a function', () => {
    const testDispatchOnMount = { test: true };
    const dispatchOnMount = jest.fn(() => ({ dom: true }));

    @track(testDispatchOnMount, { dispatch, dispatchOnMount })
    class TestComponent extends React.Component {
      render() {
        return null;
      }
    }

    mount(<TestComponent />);

    expect(dispatchOnMount).toHaveBeenCalledWith(testDispatchOnMount);
    expect(dispatch).toHaveBeenCalledWith({ dom: true, test: true });
  });

  it('will dispatch a pageview event on mount on class component', () => {
    function RawApp({ children }) {
      return <div>{children}</div>;
    }

    const App = track(
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
    )(RawApp);

    @track({ page: 'Page' })
    class Page extends React.Component {
      render() {
        return <div>Page</div>;
      }
    }

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
    function RawApp({ children }) {
      return <div>{children}</div>;
    }

    const App = track(
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
    )(RawApp);

    const Page = track({ page: 'Page' })(() => <div>Page</div>);

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
    function RawApp({ children }) {
      return <div>{children}</div>;
    }
    const App = track(
      { topLevel: true },
      {
        dispatch,
        process: () => null,
      }
    )(RawApp);
    const Page = track({ page: 'Page' })(() => <div>Page</div>);

    mount(
      <App>
        <Page />
      </App>
    );

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should not dispatch a pageview event on mount if proccess returns falsy value', () => {
    function RawApp({ children }) {
      return <div>{children}</div>;
    }
    const App = track(
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
    )(RawApp);
    const Page = track({})(() => <div>Page</div>);

    mount(
      <App>
        <Page />
      </App>
    );

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('will dispatch a top level pageview event on every page and component specific event on mount', () => {
    function RawApp({ children }) {
      return <div>{children}</div>;
    }

    const App = track(
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
    )(RawApp);

    @track({ page: 'Page1' })
    class Page1 extends React.Component {
      render() {
        return <div>Page</div>;
      }
    }

    @track(
      { page: 'Page2' },
      { dispatchOnMount: () => ({ page2specific: true }) }
    )
    class Page2 extends React.Component {
      render() {
        return <div>Page</div>;
      }
    }

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
    function RawApp({ children }) {
      return <div>{children}</div>;
    }

    const App = track(
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
    )(RawApp);

    @track(({ runtimeData }) => ({ page: 'Page', runtimeData }))
    class Page extends React.Component {
      render() {
        return <div>Page</div>;
      }
    }

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
    function RawApp({ children }) {
      return <div>{children}</div>;
    }

    const App = track(
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
    )(RawApp);

    @track({ page: 'Page' })
    class Page extends React.Component {
      render() {
        return <div>{this.props.children}</div>;
      }
    }

    @track({ view: 'View' })
    class Nested extends React.Component {
      render() {
        return <div>{this.props.children}</div>;
      }
    }

    @track({ region: 'Button' })
    class Button extends React.Component {
      @track({ event: 'buttonClick' })
      handleClick = jest.fn();

      render() {
        return (
          <button type="button" onClick={this.handleClick}>
            Click me!
          </button>
        );
      }
    }

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
    @track(testDataContext, { dispatch })
    class TestOptions extends React.Component {
      constructor() {
        super();
        this.state = {
          booleanState: true, // eslint-disable-line react/no-unused-state
        };
      }

      @track((props, state) => ({ booleanState: state.booleanState }))
      exampleMethod = () => {};

      render() {
        this.exampleMethod();
        return <div />;
      }
    }

    mount(<TestOptions />);

    expect(dispatchTrackingEvent).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      ...testDataContext,
      ...testState,
    });
  });

  it('can read tracking data from props.tracking.getTrackingData()', () => {
    const mockReader = jest.fn();

    @track(({ onProps }) => ({ onProps, ...testDataContext }))
    class TestOptions extends React.Component {
      render() {
        return this.props.children;
      }
    }

    @track({ child: true })
    class TestChild extends React.Component {
      render() {
        mockReader(this.props.tracking.getTrackingData());
        return 'hi';
      }
    }

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

    @track({}, { process })
    class NestedComponent extends React.Component {
      render() {
        return <div />;
      }
    }

    function Intermediate() {
      return (
        <div>
          <NestedComponent />
        </div>
      );
    }

    @track({}, { process })
    class TestComponent extends React.Component {
      render() {
        return (
          <div>
            <Intermediate />
          </div>
        );
      }
    }

    mount(<TestComponent />);

    expect(global.console.error).toHaveBeenCalledTimes(1);
    expect(global.console.error).toHaveBeenCalledWith(
      '[react-tracking] options.process should be defined once on a top-level component'
    );
  });

  it('will dispatch different data if props changed', () => {
    @track(props => ({ data: props.data }))
    class Top extends React.Component {
      render() {
        return this.props.children;
      }
    }

    @track({ page: 'Page' })
    class Page extends React.Component {
      @track({ event: 'buttonClick' })
      handleClick = jest.fn();

      render() {
        return <span onClick={this.handleClick}>Click Me</span>; // eslint-disable-line
      }
    }

    @track({}, { dispatch })
    class App extends React.Component {
      constructor(props) {
        super(props);
        this.state = { data: 1 };
      }

      render() {
        return (
          <div>
            <button type="button" onClick={() => this.setState({ data: 2 })} />
            <Top data={this.state.data}>
              <Page />
            </Top>
          </div>
        );
      }
    }

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

  it('does not prevent components using the legacy context API and hoist-non-react-statics < v3.1.0 from receiving updates', () => {
    const withLegacyContext = DecoratedComponent => {
      class WithLegacyContext extends React.Component {
        static contextTypes = { theme: PropTypes.string };

        render() {
          return (
            <DecoratedComponent
              {...this.props} // eslint-disable-line react/jsx-props-no-spreading
              theme={this.context.theme}
            />
          );
        }
      }

      hoistNonReactStatics(WithLegacyContext, DecoratedComponent);

      // Explicitly hoist statc contextType to simulate behavior of
      // hoist-non-react-statics versions older than v3.1.0
      WithLegacyContext.contextType = DecoratedComponent.contextType;

      return WithLegacyContext;
    };

    @track()
    class Top extends React.Component {
      render() {
        return this.props.children;
      }
    }

    @withLegacyContext
    @track({ page: 'Page' }, { dispatchOnMount: true })
    class Page extends React.Component {
      render() {
        return <span>{this.props.theme}</span>;
      }
    }

    @track()
    class App extends React.Component {
      static childContextTypes = { theme: PropTypes.string };

      constructor(props) {
        super(props);
        this.state = { theme: 'light' };
      }

      getChildContext() {
        return { theme: this.state.theme };
      }

      handleUpdateTheme = () => {
        this.setState({ theme: 'dark' });
      };

      render() {
        return (
          <div>
            <button type="button" onClick={this.handleUpdateTheme} />
            <Top>
              <Page />
            </Top>
          </div>
        );
      }
    }

    const wrapper = mount(<App />);
    expect(wrapper.find('span').text()).toBe('light');

    wrapper.find('button').simulate('click');
    expect(wrapper.find('span').text()).toBe('dark');
  });

  it('root context items are accessible to children', () => {
    const ReactTrackingContext = (
      useBuiltLib
        ? require('../../build/ReactTrackingContext')
        : require('../ReactTrackingContext')
    ).default;

    const App = track()(() => <Child />);

    function Child() {
      const trackingContext = useContext(ReactTrackingContext);
      expect(Object.keys(trackingContext.tracking)).toEqual([
        'dispatch',
        'getTrackingData',
        'process',
      ]);
      return <div />;
    }

    mount(<App />);
  });

  it('dispatches tracking events from a useTracking hook tracking object', () => {
    const outerTrackingData = {
      page: 'Page',
    };

    const Page = track(outerTrackingData, { dispatch })(
      props => props.children
    );

    function Child() {
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
    }

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

    @track()
    class Page extends React.Component {
      constructor() {
        super();
        this.message = message;
        this.state = {};
      }

      @track(
        (props, state, methodArgs, [{ value }, err]) =>
          !err && {
            label: 'async action',
            status: 'success',
            value,
          }
      )
      handleAsyncAction() {
        return Promise.resolve(this.message);
      }

      async executeAction() {
        const data = await this.handleAsyncAction();
        this.setState({ data });
      }

      render() {
        return <div>{this.state.data && this.state.data.value}</div>;
      }
    }

    // Get the first child since the page is wrapped with the WithTracking component.
    const page = await mount(<Page />).childAt(0);
    await page.instance().executeAction();

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

    @track()
    class Page extends React.Component {
      constructor() {
        super();
        this.message = message;
        this.state = {};
      }

      @track(
        // eslint-disable-next-line no-unused-vars
        (props, state, methodArgs, [{ value }, err]) =>
          err && {
            label: 'async action',
            status: 'failed',
          }
      )
      handleAsyncAction() {
        return Promise.reject(this.message);
      }

      async executeAction() {
        try {
          const data = await this.handleAsyncAction();
          this.setState({ data });
        } catch (error) {
          this.setState({ data: error });
        }
      }

      render() {
        return <div>{this.state.data && this.state.data.value}</div>;
      }
    }

    // Get the first child since the page is wrapped with the WithTracking component.
    const page = await mount(<Page />).childAt(0);
    await page.instance().executeAction();

    expect(page.state().data).toEqual(message);
    expect(dispatchTrackingEvent).toHaveBeenCalledTimes(1);
    expect(dispatchTrackingEvent).toHaveBeenCalledWith({
      label: 'async action',
      status: 'failed',
    });
  });

  it('can access wrapped component by ref', async () => {
    const focusFn = jest.fn();
    @track({}, { forwardRef: true })
    class Child extends React.Component {
      focus = focusFn;

      render() {
        return 'child';
      }
    }

    class Parent extends React.Component {
      componentDidMount() {
        this.child.focus();
      }

      render() {
        return (
          <Child
            ref={el => {
              this.child = el;
            }}
          />
        );
      }
    }

    const parent = await mount(<Parent />);

    expect(parent.instance().child).not.toBeNull();
    expect(focusFn).toHaveBeenCalledTimes(1);
  });

  it('can establish tracking context with only hooks', () => {
    function MyButton() {
      const { trackEvent } = useTracking({ element: 'MyButton' });
      return (
        <button
          type="button"
          onClick={() => {
            trackEvent({ event: 'buttonClick' });
          }}
        >
          Click me
        </button>
      );
    }

    function App() {
      const { Track } = useTracking(
        { page: 'App' },
        { dispatch, dispatchOnMount: true }
      );
      return (
        <Track>
          <MyButton />
        </Track>
      );
    }

    const wrappedApp = mount(<App />);
    wrappedApp.find('button').simulate('click');

    expect(dispatch).toHaveBeenCalledTimes(2);
    // dispatch on mount
    expect(dispatch).toHaveBeenCalledWith({
      page: 'App',
    });
    // simulated button click
    expect(dispatch).toHaveBeenCalledWith({
      page: 'App',
      event: 'buttonClick',
      element: 'MyButton',
    });
  });
};

describe('e2e', () => {
  if (process.env.SKIP_BUILT_LIB_CHECK !== 'true') {
    describe('with built lib', () => {
      runTests(true);
    });
  }

  describe('with source lib', () => {
    runTests(false);
  });
});
