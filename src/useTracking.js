import merge from 'deepmerge';
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
      getTrackingData: () => trackingContext.tracking.data,
      trackEvent: data =>
        trackingContext.tracking.dispatch(
          merge(trackingContext.tracking.data, data)
        ),
    }),
    [trackingContext.tracking.data]
  );
}
