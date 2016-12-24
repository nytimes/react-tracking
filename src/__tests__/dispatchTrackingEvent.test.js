const mockCustomEvent = jest.fn();
jest.setMock('custom-event', mockCustomEvent);

const mockDispatchEvent = jest.fn();
global.document.dispatchEvent = mockDispatchEvent;

describe('dispatchTrackingEvent', () => {
   const dispatchTrackingEvent = require('../dispatchTrackingEvent').default;

    it('exports a function', () => {
        expect(typeof dispatchTrackingEvent).toBe('function');
    });

    it('properly dispatches custom event', () => {
        const testEventData = {};
        dispatchTrackingEvent(testEventData);

        expect(mockDispatchEvent).toHaveBeenCalled();
        expect(mockCustomEvent).toHaveBeenCalledWith('FirehoseTrackingEvent', {
            detail: testEventData
        });
    });
});
