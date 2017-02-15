import React, { Component, PropTypes } from 'react';
import merge from 'lodash.merge';
import dispatchTrackingEvent from './dispatchTrackingEvent';

export const TrackingPropType = PropTypes.shape({
  data: PropTypes.object,
  dispatch: PropTypes.func,
});

export default function withTrackingComponentDecorator(
  trackingData = {},
  { dispatch = dispatchTrackingEvent, dispatchOnMount = false } = {}
) {
  return (DecoratedComponent) => {
    const decoratedComponentName = DecoratedComponent.displayName || DecoratedComponent.name || 'Component';

    return class WithTracking extends Component {
      static displayName = `WithTracking(${decoratedComponentName})`;
      static contextTypes = {
        tracking: TrackingPropType,
      };
      static childContextTypes = {
        tracking: TrackingPropType,
      };

      getTrackingData = data => merge({}, this.getChildContext().tracking.data, data)

      trackEvent = (data) => {
        this.getTrackingDispatcher()(
          // deep-merge tracking data from context and tracking data passed in here
          this.getTrackingData(data)
        );
      }

      getTrackingDispatcher() {
        return (this.context.tracking && this.context.tracking.dispatch) || dispatch;
      }

      getChildContext() {
        const thisTrackingData = typeof trackingData === 'function'
                    ? trackingData(this.props)
                    : trackingData;

        const contextData = (this.context.tracking && this.context.tracking.data) || {};

        return {
          tracking: {
            data: merge({}, contextData, thisTrackingData),
            dispatch: this.getTrackingDispatcher(),
          },
        };
      }

      componentDidMount() {
        if (dispatchOnMount === true) {
          this.trackEvent();
        }

        if (typeof dispatchOnMount === 'function') {
          this.trackEvent(dispatchOnMount(this.getTrackingData()));
        }
      }

      render() {
        return (
          <DecoratedComponent
            {...this.props}
            trackEvent={this.trackEvent}
          />
        );
      }
    };
  };
}
