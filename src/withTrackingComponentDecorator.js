import React, { Component, PropTypes } from 'react';
import dispatchTrackingEvent from './dispatchTrackingEvent';

export default function withTrackingComponentDecorator(
  trackingContext = {},
  options = { dispatch: dispatchTrackingEvent }
) {
  return (DecoratedComponent) => {
    const decoratedComponentName = DecoratedComponent.displayName || DecoratedComponent.name || 'Component';

    return class WithTracking extends Component {
      static displayName = `WithTracking(${decoratedComponentName})`;
      static contextTypes = {
        tracking: PropTypes.object,
        _trackingDispatcher: PropTypes.func,
      };
      static childContextTypes = {
        tracking: PropTypes.object,
        _trackingDispatcher: PropTypes.func,
      };

      trackEvent = (data) => {
        this.getTrackingDispatcher()({
          ...this.getChildContext().tracking,
          ...data,
        });
      }

      getTrackingDispatcher() {
        return this.context._trackingDispatcher || options.dispatch; // eslint-disable-line
      }

      getChildContext() {
        const thisTrackingContext = typeof trackingContext === 'function'
                    ? trackingContext(this.props)
                    : trackingContext;
        return {
          tracking: {
            ...this.context.tracking,
            ...thisTrackingContext,
          },
          _trackingDispatcher: this.getTrackingDispatcher(),
        };
      }

      componentDidMount() {
        if (trackingContext.page) {
          this.trackEvent({
            action: 'pageview',
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
