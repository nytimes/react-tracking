import { useContext, useMemo } from 'react';
import { ReactTrackingContext } from './withTrackingComponentDecorator';

export default function useTracking() {
  const { dispatch, getTrackingData } = useContext(ReactTrackingContext);

  if (!dispatch) {
    throw new Error(
      'Attempting to call `useTracking` ' +
        'without a ReactTrackingContext present. Did you forget to wrap the top of ' +
        'your component tree with `track`?'
    );
  }

  return useMemo(
    () => ({
      getTrackingData,
      trackEvent: dispatch,
    }),
    [getTrackingData, dispatch]
  );
}
