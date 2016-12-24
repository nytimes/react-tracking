jest.mock('../withTrackingComponentDecorator');
jest.mock('../trackEventMethodDecorator');

describe('nyt-react-tracking', () => {
  const index = require('../'); // eslint-disable-line global-require

  it('exports withTracking', () => {
    expect(index.withTracking).toBeDefined();
  });
  it('exports trackEvent', () => {
    expect(index.trackEvent).toBeDefined();
  });
});
