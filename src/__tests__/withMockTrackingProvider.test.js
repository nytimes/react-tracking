const withMTPMockWrapped = jest.fn();
const withMTPMockDispatch = jest.fn(() => withMTPMockWrapped);

jest.setMock('../trackingHoC', withMTPMockDispatch);

describe('mock tracking provider', () => {
  // eslint-disable-next-line global-require
  const withMockTrackingProvider = require('../withMockTrackingProvider')
    .default;

  const ComponentToWrap = () => {};

  const stubDispatch = () => {};
  const expectedTrackingArguments = [{}, { dispatch: stubDispatch }];

  beforeEach(() => {
    withMockTrackingProvider(stubDispatch)(ComponentToWrap);
  });

  it('calls trackingHoC with the correct arguments', () => {
    expect(withMTPMockDispatch).toHaveBeenCalledWith(
      ...expectedTrackingArguments
    );
  });

  it('calls the returned function with the wrapped component', () => {
    expect(withMTPMockWrapped).toHaveBeenCalledWith(ComponentToWrap);
  });
});
