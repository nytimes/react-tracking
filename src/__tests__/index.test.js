jest.mock('../withTrackingComponentDecorator');
jest.mock('../trackEventMethodDecorator');

describe('nyt-react-tracking', () => {
    const index = require('../');
    it('exports withTracking', () => {
        expect(index.withTracking).toBeDefined();
    });
    it('exports trackEvent', () => {
        expect(index.trackEvent).toBeDefined();
    });
});
