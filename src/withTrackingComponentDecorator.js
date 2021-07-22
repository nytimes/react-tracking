import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import PropTypes from 'prop-types';

import ReactTrackingContext from './ReactTrackingContext';
import useTrackingImpl from './useTrackingImpl';

export default function withTrackingComponentDecorator(
  trackingData = {},
  { forwardRef = false, ...options } = {}
) {
  return DecoratedComponent => {
    const decoratedComponentName =
      DecoratedComponent.displayName || DecoratedComponent.name || 'Component';

    function WithTracking({ rtFwdRef, ...props }) {
      const latestProps = useRef(props);

      useEffect(() => {
        // keep the latest props in a mutable ref object to avoid creating
        // additional dependency that could cause unnecessary re-renders
        // see https://reactjs.org/docs/hooks-faq.html#what-can-i-do-if-my-effect-dependencies-change-too-often
        latestProps.current = props;
      });

      const trackingDataFn = useCallback(
        () =>
          typeof trackingData === 'function'
            ? trackingData(latestProps.current)
            : trackingData,
        []
      );

      const contextValue = useTrackingImpl(trackingDataFn, options);

      const trackingProp = useMemo(
        () => ({
          trackEvent: contextValue.tracking.dispatch,
          getTrackingData: contextValue.tracking.getTrackingData,
        }),
        [contextValue]
      );

      const propsToBePassed = useMemo(
        () => (forwardRef ? { ...props, ref: rtFwdRef } : props),
        [props, rtFwdRef]
      );

      return (
        <ReactTrackingContext.Provider value={contextValue}>
          {React.createElement(DecoratedComponent, {
            ...propsToBePassed,
            tracking: trackingProp,
          })}
        </ReactTrackingContext.Provider>
      );
    }

    if (forwardRef) {
      const forwarded = React.forwardRef((props, ref) =>
        React.createElement(WithTracking, { ...props, rtFwdRef: ref })
      );
      forwarded.displayName = `WithTracking(${decoratedComponentName})`;
      hoistNonReactStatics(forwarded, DecoratedComponent);
      return forwarded;
    }

    WithTracking.displayName = `WithTracking(${decoratedComponentName})`;
    WithTracking.propTypes = {
      rtFwdRef: PropTypes.oneOfType([
        PropTypes.func,
        // eslint-disable-next-line react/forbid-prop-types
        PropTypes.shape({ current: PropTypes.any }),
      ]),
    };
    WithTracking.defaultProps = { rtFwdRef: undefined };

    hoistNonReactStatics(WithTracking, DecoratedComponent);
    return WithTracking;
  };
}
