import React, { Component, PropTypes } from 'react';
import merge from 'lodash.merge';
import dispatchTrackingEvent from './dispatchTrackingEvent';

export const TrackingPropType = PropTypes.shape({
  data: PropTypes.object,
  dispatch: PropTypes.func,
  process: PropTypes.func,
});

export default function withTrackingComponentDecorator(
  trackingData = {},
  {
    dispatch = dispatchTrackingEvent,
    dispatchOnMount = false,
    process,
  } = {}
) {
  return (DecoratedComponent) => {
    const decoratedComponentName = DecoratedComponent.displayName || DecoratedComponent.name || 'Component';

    return class WithTracking extends Component {
      constructor(props, context) {
        super(props, context);

        if (context.tracking && context.tracking.process && process) {
          console.error('[nyt-react-tracking] options.process should be used once on top level component');
        }
      }

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
            process: (this.context.tracking && this.context.tracking.process) || process,
          },
        };
      }

      componentDidMount() {
        const contextTrackingData = this.getTrackingData();
        const contextProcess = this.context.tracking && this.context.tracking.process;

        if (typeof contextProcess === 'function' && typeof dispatchOnMount === 'function') {
          this.trackEvent(merge(
            {},
            contextProcess(contextTrackingData),
            dispatchOnMount(contextTrackingData)
          ));
        } else if (typeof contextProcess === 'function') {
          const processed = contextProcess(contextTrackingData);
          if (processed) {
            this.trackEvent(processed);
          }
        } else if (typeof dispatchOnMount === 'function') {
          this.trackEvent(dispatchOnMount(contextTrackingData));
        } else if (dispatchOnMount === true) {
          this.trackEvent();
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
