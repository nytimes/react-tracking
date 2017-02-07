'use strict';

jest.mock('../withTrackingComponentDecorator');
jest.mock('../trackEventMethodDecorator');

describe('nyt-react-tracking', function () {
  // eslint-disable-next-line global-require
  var index = require('../');

  it('exports withTracking', function () {
    expect(index.withTracking).toBeDefined();
  });
  it('exports trackEvent', function () {
    expect(index.trackEvent).toBeDefined();
  });
});