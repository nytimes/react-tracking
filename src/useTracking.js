import { useContext, useMemo } from 'react';
import { ReactTrackingContext } from './withTrackingComponentDecorator';

export default function useTracking() {
  const trackingContext = useContext(ReactTrackingContext);

  if (!(trackingContext && trackingContext.tracking)) {
    throw new Error(
      'Attempting to call `useTracking` ' +
        'without a ReactTrackingContext present. Did you forget to wrap the top of ' +
        'your component tree with `track`?'
    );
  }

  return useMemo(
    () => ({
      getTrackingData: trackingContext.tracking.getTrackingData,
      trackEvent: trackingContext.tracking.dispatch,
    }),
    [
      trackingContext.tracking.getTrackingData,
      trackingContext.tracking.dispatch,
    ]
  );
}
