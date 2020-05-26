/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import merge from 'deepmerge';
import hoistNonReactStatic from 'hoist-non-react-statics';

import dispatchTrackingEvent from './dispatchTrackingEvent';

export const ReactTrackingContext = React.createContext({});

export default function withTrackingComponentDecorator(
  trackingData = {},
  {
    dispatch = dispatchTrackingEvent,
    dispatchOnMount = false,
    process,
    forwardRef = false,
  } = {}
) {
  return DecoratedComponent => {
    const decoratedComponentName =
      DecoratedComponent.displayName || DecoratedComponent.name || 'Component';

    function WithTracking({ rtFwdRef, ...props }) {
      const { tracking } = useContext(ReactTrackingContext);
      const latestProps = useRef(props);

      useEffect(() => {
        // keep the latest props in a mutable ref object to avoid creating
        // additional dependency that could cause unnecessary re-renders
        // see https://reactjs.org/docs/hooks-faq.html#what-can-i-do-if-my-effect-dependencies-change-too-often
        latestProps.current = props;
      });

      // statically extract tracking.process for hook dependency
      const trkProcess = tracking && tracking.process;
      const getProcessFn = useCallback(() => trkProcess, [trkProcess]);

      const getOwnTrackingData = useCallback(() => {
        const ownTrackingData =
          typeof trackingData === 'function'
            ? trackingData(latestProps.current)
            : trackingData;
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
      }, [getOwnTrackingData, tracking]);

      const trackEvent = useCallback(
        (data = {}) => {
          getTrackingDispatcher()(data);
        },
        [getTrackingDispatcher]
      );

      useEffect(() => {
        const contextProcess = getProcessFn();
        const getTrackingData = getTrackingDataFn();

        if (getProcessFn() && process) {
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
      }, [getOwnTrackingData, getProcessFn, getTrackingDataFn, trackEvent]);

      const trackingProp = useMemo(
        () => ({
          trackEvent,
          getTrackingData: getTrackingDataFn(),
        }),
        [trackEvent, getTrackingDataFn]
      );

      const contextValue = useMemo(
        () => ({
          tracking: {
            dispatch: getTrackingDispatcher(),
            getTrackingData: getTrackingDataFn(),
            process: getProcessFn() || process,
          },
        }),
        [getTrackingDispatcher, getTrackingDataFn, getProcessFn]
      );

      const propsToBePassed = useMemo(
        () => (forwardRef ? { ...props, ref: rtFwdRef } : props),
        [props, rtFwdRef]
      );

      return useMemo(
        () => (
          <ReactTrackingContext.Provider value={contextValue}>
            <DecoratedComponent {...propsToBePassed} tracking={trackingProp} />
          </ReactTrackingContext.Provider>
        ),
        [contextValue, trackingProp, propsToBePassed]
      );
    }

    if (forwardRef) {
      const forwarded = React.forwardRef((props, ref) => (
        <WithTracking {...props} rtFwdRef={ref} />
      ));
      forwarded.displayName = `WithTracking(${decoratedComponentName})`;
      hoistNonReactStatic(forwarded, DecoratedComponent);
      return forwarded;
    }

    WithTracking.displayName = `WithTracking(${decoratedComponentName})`;
    hoistNonReactStatic(WithTracking, DecoratedComponent);
    return WithTracking;
  };
}
