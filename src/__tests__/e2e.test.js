/* eslint-disable react/no-multi-comp,react/prop-types,react/prefer-stateless-function  */
import React from 'react';
import { mount } from 'enzyme';

const dispatchTrackingEvent = jest.fn();
jest.setMock('../dispatchTrackingEvent', dispatchTrackingEvent);

const PAGEVIEW_ACTION = { event: 'pageDataReady' };
const testDataContext = { testDataContext: true };
const testData = { testData: true };
const dispatch = jest.fn();

describe('e2e', () => {
  // eslint-disable-next-line global-require
  const track = require('../').default;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('defaults to dispatchTrackingEvent when no dispatch function passed in to options', () => {
    const testPageData = { page: 'TestPage' };

    @track(testPageData)
    class TestPage extends React.Component {
      render() {
        return null;
      }
    }

    mount(<TestPage />);

    expect(dispatchTrackingEvent).toHaveBeenCalledWith({
      ...PAGEVIEW_ACTION,
      ...testPageData,
    });
  });

  it('accepts a dispatch function in options', () => {
    @track(testDataContext, { dispatch })
    class TestOptions extends React.Component {
      @track(testData)
      blah = () => {}

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

    @track(testChildData)
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
      ...PAGEVIEW_ACTION,
      ...testDataContext,
      ...testChildData,
    });
  });

  it('will deep-merge tracking data', () => {
    const testData1 = { key: { x: 1, y: 1 } };
    // TODO: Refactor this to use "dispatchImmediately" when https://github.com/nytm/nyt-react-tracking/issues/15 lands
    const testData2 = { key: { x: 2, z: 2 }, page: true };

    @track(testData1)
    class TestData1 extends React.Component {
      render() { return this.props.children; }
    }

    const TestData2 = track(testData2)(() => <div />);

    mount(
      <TestData1>
        <TestData2 />
      </TestData1>
    );

    expect(dispatchTrackingEvent).toHaveBeenCalledWith({
      ...PAGEVIEW_ACTION,
      page: true,
      key: {
        x: 2, y: 1, z: 2,
      },
    });
  });
});
