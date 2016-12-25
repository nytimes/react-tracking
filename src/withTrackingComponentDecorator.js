import React, { Component, PropTypes } from 'react';
import dispatchTrackingEvent from './dispatchTrackingEvent';

export default function withTrackingComponentDecorator(trackingContext = {}) {
  return (DecoratedComponent) => {
    const decoratedComponentName = DecoratedComponent.displayName || DecoratedComponent.name || 'Component';

    return class WithTracking extends Component {
      static displayName = `WithTracking(${decoratedComponentName})`;
      static contextTypes = {
        tracking: PropTypes.object,
      };
      static childContextTypes = {
        tracking: PropTypes.object,
      };

      trackEvent = (data) => {
        dispatchTrackingEvent({
          ...this.getChildContext().tracking,
          ...data,
        });
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
