import trackingHoC from './trackingHoC';

const withMockTrackingProvider = dispatch => WrappedComponent =>
  trackingHoC({}, { dispatch })(WrappedComponent);

export default withMockTrackingProvider;
