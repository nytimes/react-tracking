import { useCallback, useContext, useEffect, useMemo } from 'react';
import merge from 'deepmerge';

import ReactTrackingContext from './ReactTrackingContext';
import dispatchTrackingEvent from './dispatchTrackingEvent';

export default function useTrackingImpl(
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

  return useMemo(
    () => ({
      tracking: {
        dispatch: getTrackingDispatcher(),
        getTrackingData: getTrackingDataFn(),
        process: getProcessFn() || process,
      },
    }),
    [getTrackingDispatcher, getTrackingDataFn, getProcessFn, process]
  );
}
