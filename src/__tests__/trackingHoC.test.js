import React from 'react';

const wTCDmock = jest.fn(() => () => {});
jest.setMock('../withTrackingComponentDecorator', wTCDmock);

const tEMDmock = jest.fn(() => () => {});
jest.setMock('../trackEventMethodDecorator', tEMDmock);


describe('tracking HoC', () => {
  // eslint-disable-next-line global-require
  const trackingHoC = require('../trackingHoC').default;

  it('detects a class', () => {
    @trackingHoC({ testClass: true })
    class TestClass extends React.Component {} // eslint-disable-line

    new TestClass(); // eslint-disable-line no-new

    expect(wTCDmock).toHaveBeenCalled();
  });

  it('detects a class method', () => {
    class TestMethod {
      @trackingHoC({ testMethod: true })
      blah = () => {}
    }

    const myTest = new TestMethod();
    myTest.blah();

    expect(tEMDmock).toHaveBeenCalled();
  });
});
