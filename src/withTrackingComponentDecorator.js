import React, { Component, PropTypes } from 'react';
import dispatchTrackingEvent from './dispatchTrackingEvent';

export const TrackingPropType = PropTypes.shape({
  data: PropTypes.object,
  dispatch: PropTypes.func,
});

export default function withTrackingComponentDecorator(
  trackingData = {},
  options = { dispatch: dispatchTrackingEvent }
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

      trackEvent = (data) => {
        this.getTrackingDispatcher()({
          ...this.getChildContext().tracking.data,
          ...data,
        });
      }

      getTrackingDispatcher() {
        return (this.context.tracking && this.context.tracking.dispatch) || options.dispatch;
      }

      getChildContext() {
        const thisTrackingData = typeof trackingData === 'function'
                    ? trackingData(this.props)
                    : trackingData;

        const contextData = (this.context.tracking && this.context.tracking.data) || {};

        return {
          tracking: {
            data: {
              ...contextData,
              ...thisTrackingData,
            },
            dispatch: this.getTrackingDispatcher(),
          },
        };
      }

      componentDidMount() {
        if (trackingData.page) {
          this.trackEvent({
            event: 'pageDataReady',
          });
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
