import React, { useCallback, useDebugValue, useMemo } from 'react';

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

  useDebugValue(contextValue.tracking.getTrackingData, getTrackingData =>
    getTrackingData()
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
