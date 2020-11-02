import React, { useCallback, useMemo } from 'react';

import ReactTrackingContext from './ReactTrackingContext';
import useTrackingImpl from './useTrackingImpl';

export default function useTracking(trackingData, options) {
  const contextValue = useTrackingImpl(trackingData, options);

  const Track = useCallback(
    ({ children }) => (
      <ReactTrackingContext.Provider value={contextValue}>
        {children}
      </ReactTrackingContext.Provider>
    ),
    [contextValue]
  );

  return useMemo(
    () => ({
      Track,
      getTrackingData: contextValue.tracking.getTrackingData,
      trackEvent: contextValue.tracking.dispatch,
    }),
    [contextValue, Track]
  );
}
