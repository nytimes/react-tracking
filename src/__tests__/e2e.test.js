/* eslint-disable react/no-multi-comp,react/prop-types,react/prefer-stateless-function  */
import React from 'react';
import { mount } from 'enzyme';

const dispatchTrackingEvent = jest.fn();
jest.setMock('../dispatchTrackingEvent', dispatchTrackingEvent);

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
      render() { return this.props.children; }
    }

    const TestData2 = track(testData2, { dispatchOnMount: true })(() => <div />);

    mount(
      <TestData1>
        <TestData2 />
      </TestData1>
    );

    expect(dispatchTrackingEvent).toHaveBeenCalledWith({
      page: 'TestDeepMerge',
      key: {
        x: 2, y: 1, z: 2,
      },
    });
  });

  it('will call dispatchOnMount as a function', () => {
    const testDispatchOnMount = { test: true };
    const dispatchOnMount = jest.fn(() => ({ dom: true }));

    @track(testDispatchOnMount, { dispatch, dispatchOnMount })
    class TestComponent extends React.Component {
      render() { return null; }
    }

    mount(<TestComponent />);

    expect(dispatchOnMount).toHaveBeenCalledWith(testDispatchOnMount);
    expect(dispatch).toHaveBeenCalledWith({ dom: true });
  });
});
