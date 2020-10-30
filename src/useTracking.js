import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import merge from 'deepmerge';

import dispatchTrackingEvent from './dispatchTrackingEvent';

export const ReactTrackingContext = React.createContext({});

export default function useTracking(
  trackingData = {},
  { dispatch = dispatchTrackingEvent, dispatchOnMount = false, process } = {}
) {
  const { tracking } = useContext(ReactTrackingContext);

  const getProcessFn = useCallback(() => tracking && tracking.process, [
    tracking,
  ]);

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

  const nextDispatch = useMemo(() => getTrackingDispatcher(), [
    getTrackingDispatcher,
  ]);
  const nextGetTrackingData = useMemo(() => getTrackingDataFn(), [
    getTrackingDataFn,
  ]);

  const contextValue = useMemo(
    () => ({
      tracking: {
        dispatch: nextDispatch,
        getTrackingData: nextGetTrackingData,
        process: getProcessFn() || process,
      },
    }),
    [nextDispatch, nextGetTrackingData, getProcessFn, process]
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
      getTrackingData: nextGetTrackingData,
      trackEvent: nextDispatch,
      Track: TrackingProvider,
    }),
    [nextDispatch, nextGetTrackingData, TrackingProvider]
  );
}
