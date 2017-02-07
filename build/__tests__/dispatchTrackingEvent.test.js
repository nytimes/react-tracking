'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mockCustomEvent = jest.fn();
jest.setMock('custom-event', mockCustomEvent);

var mockDispatchEvent = jest.fn();
global.document.dispatchEvent = mockDispatchEvent;

describe('dispatchTrackingEvent', function () {
  // eslint-disable-next-line global-require
  var dispatchTrackingEvent = require('../dispatchTrackingEvent').default;

  it('exports a function', function () {
    expect(typeof dispatchTrackingEvent === 'undefined' ? 'undefined' : (0, _typeof3.default)(dispatchTrackingEvent)).toBe('function');
  });

  it('properly dispatches custom event', function () {
    var testEventData = {};
    dispatchTrackingEvent(testEventData);

    expect(mockDispatchEvent).toHaveBeenCalled();
    expect(mockCustomEvent).toHaveBeenCalledWith('FirehoseTrackingEvent', {
      detail: testEventData
    });
  });
});