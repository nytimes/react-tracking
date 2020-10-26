import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import merge from 'deepmerge';

import { ReactTrackingContext } from './withTrackingComponentDecorator';
import dispatchTrackingEvent from './dispatchTrackingEvent';

export default function useTracking(
  trackingData = {},
  { dispatch = dispatchTrackingEvent, dispatchOnMount = false, process } = {}
) {
  const trackingContext = useContext(ReactTrackingContext);

  // if (!(trackingContext && trackingContext.tracking)) {
  //   throw new Error(
  //     'Attempting to call `useTracking` ' +
  //       'without a ReactTrackingContext present. Did you forget to wrap the top of ' +
  //       'your component tree with `track`?'
  //   );
  // }

  // statically extract tracking.process for hook dependency
  const tracking = useMemo(() => trackingContext.tracking || {}, [
    trackingContext.tracking,
  ]);
  const trkProcess = tracking.process;
  const getProcessFn = useCallback(() => trkProcess, [trkProcess]);

  const getOwnTrackingData = useCallback(() => {
    const ownTrackingData =
      typeof trackingData === 'function' ? trackingData() : trackingData;
    return ownTrackingData || {};
  }, [trackingData]);

  const getTrackingDataFn = useCallback(() => {
    const contextGetTrackingData =
      (tracking && tracking.getTrackingData) || getOwnTrackingData;

    return () =>
      contextGetTrackingData === getOwnTrackingData
        ? getOwnTrackingData()
        : merge(contextGetTrackingData(), getOwnTrackingData());
  }, [getOwnTrackingData, tracking]);

  const getTrackingDispatcher = useCallback(() => {
    const contextDispatch = (tracking && tracking.dispatch) || dispatch;
    return data => contextDispatch(merge(getOwnTrackingData(), data || {}));
  }, [getOwnTrackingData, tracking, dispatch]);

  const trackEvent = useCallback(
    (data = {}) => {
      getTrackingDispatcher()(data);
    },
    [getTrackingDispatcher]
  );

  useEffect(() => {
    const contextProcess = getProcessFn();
    const getTrackingData = getTrackingDataFn();

    if (contextProcess && process) {
      // eslint-disable-next-line
      console.error(
        '[react-tracking] options.process should be defined once on a top-level component'
      );
    }

    if (
      typeof contextProcess === 'function' &&
      typeof dispatchOnMount === 'function'
    ) {
      trackEvent(
        merge(
          contextProcess(getOwnTrackingData()) || {},
          dispatchOnMount(getTrackingData()) || {}
        )
      );
    } else if (typeof contextProcess === 'function') {
      const processed = contextProcess(getOwnTrackingData());
      if (processed || dispatchOnMount === true) {
        trackEvent(processed);
      }
    } else if (typeof dispatchOnMount === 'function') {
      trackEvent(dispatchOnMount(getTrackingData()));
    } else if (dispatchOnMount === true) {
      trackEvent();
    }
  }, [
    getOwnTrackingData,
    getProcessFn,
    getTrackingDataFn,
    trackEvent,
    dispatchOnMount,
    process,
  ]);

  const contextValue = useMemo(
    () => ({
      tracking: {
        dispatch: getTrackingDispatcher(),
        getTrackingData: getTrackingDataFn(),
        process: getProcessFn() || process,
      },
    }),
    [getTrackingDispatcher, getTrackingDataFn, getProcessFn, process]
  );

  const TrackingProvider = useCallback(
    ({ children }) => (
      <ReactTrackingContext.Provider value={contextValue}>
        {children}
      </ReactTrackingContext.Provider>
    ),
    [contextValue]
  );

  return useMemo(
    () => ({
      getTrackingData: tracking.getTrackingData,
      trackEvent: tracking.dispatch,
      Track: TrackingProvider,
    }),
    [tracking.getTrackingData, tracking.dispatch, TrackingProvider]
  );
}
