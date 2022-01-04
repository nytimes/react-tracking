import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import merge from 'deepmerge';

import ReactTrackingContext from './ReactTrackingContext';
import dispatchTrackingEvent from './dispatchTrackingEvent';

export default function useTrackingImpl(trackingData, options) {
  const { tracking } = useContext(ReactTrackingContext);
  const latestData = useRef(trackingData);
  const latestOptions = useRef(options);

  useEffect(() => {
    // store the latest data & options in a mutable ref to prevent
    // dependencies from changing when the consumer passes in non-memoized objects
    // same approach that we use for props in withTrackingComponentDecorator
    latestData.current = trackingData;
    latestOptions.current = options;
  });

  const {
    dispatch = dispatchTrackingEvent,
    dispatchOnMount = false,
    process,
  } = useMemo(() => latestOptions.current || {}, []);

  const getProcessFn = useCallback(() => tracking && tracking.process, [
    tracking,
  ]);

  const getOwnTrackingData = useCallback(() => {
    const data = latestData.current;
    const ownTrackingData = typeof data === 'function' ? data() : data;
    return ownTrackingData || {};
  }, []);

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
