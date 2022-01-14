import React, {
  useCallback,
  useDebugValue,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import ReactTrackingContext from './ReactTrackingContext';
import useTrackingImpl from './useTrackingImpl';

export default function useTracking(trackingData, options) {
  const isFirstRender = useRef(true);
  const contextValue = useTrackingImpl(
    trackingData,
    isFirstRender.current,
    options
  );

  useEffect(() => {
    isFirstRender.current = false;
    return () => {
      isFirstRender.current = true;
    };
  }, []);

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
