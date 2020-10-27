/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useMemo, useRef } from 'react';
import hoistNonReactStatic from 'hoist-non-react-statics';

import useTracking from './useTracking';

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

      const { getTrackingData, trackEvent, Track } = useTracking(
        trackingData,
        options
      );

      const trackingProp = useMemo(
        () => ({
          trackEvent,
          getTrackingData,
        }),
        [trackEvent, getTrackingData]
      );

      const propsToBePassed = useMemo(
        () => (forwardRef ? { ...props, ref: rtFwdRef } : props),
        [props, rtFwdRef]
      );

      return (
        <Track>
          <DecoratedComponent {...propsToBePassed} tracking={trackingProp} />
        </Track>
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
