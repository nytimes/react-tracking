import React, { Component } from 'react';
import PropTypes from 'prop-types';
import merge from 'deepmerge';
import hoistNonReactStatic from 'hoist-non-react-statics';

import dispatchTrackingEvent from './dispatchTrackingEvent';

export const TrackingContextType = PropTypes.shape({
  data: PropTypes.object,
  dispatch: PropTypes.func,
  process: PropTypes.func,
});

export const ReactTrackingContext = React.createContext({});

export default function withTrackingComponentDecorator(
  trackingData = {},
  { dispatch = dispatchTrackingEvent, dispatchOnMount = false, process } = {}
) {
  return DecoratedComponent => {
    const decoratedComponentName =
      DecoratedComponent.displayName || DecoratedComponent.name || 'Component';

    class WithTracking extends Component {
      static displayName = `WithTracking(${decoratedComponentName})`;

      static contextType = ReactTrackingContext;

      constructor(props, context) {
        super(props, context);

        if (context.tracking && context.tracking.process && process) {
          // eslint-disable-next-line
          console.error(
            '[react-tracking] options.process should be used once on top level component'
          );
        }

        this.computeTrackingData(props, context);
        this.tracking = {
          trackEvent: this.trackEvent,
          getTrackingData: () => this.trackingData,
        };
      }

      componentDidMount() {
        const { tracking } = this.context;
        const contextProcess = tracking && tracking.process;

        if (
          typeof contextProcess === 'function' &&
          typeof dispatchOnMount === 'function'
        ) {
          this.trackEvent(
            merge(
              contextProcess(this.ownTrackingData) || {},
              dispatchOnMount(this.trackingData) || {}
            )
          );
        } else if (typeof contextProcess === 'function') {
          const processed = contextProcess(this.ownTrackingData);
          if (processed || dispatchOnMount === true) {
            this.trackEvent(processed);
          }
        } else if (typeof dispatchOnMount === 'function') {
          this.trackEvent(dispatchOnMount(this.trackingData));
        } else if (dispatchOnMount === true) {
          this.trackEvent();
        }
      }

      componentWillReceiveProps(nextProps, nextContext) {
        this.computeTrackingData(nextProps, nextContext);
      }

      getContextForProvider() {
        const { tracking } = this.context;
        return {
          tracking: {
            data: merge(
              this.contextTrackingData || {},
              this.ownTrackingData || {}
            ),
            dispatch: this.getTrackingDispatcher(),
            process: (tracking && tracking.process) || process,
          },
        };
      }

      getTrackingDispatcher() {
        const { tracking } = this.context;
        return (tracking && tracking.dispatch) || dispatch;
      }

      trackEvent = data => {
        this.getTrackingDispatcher()(
          // deep-merge tracking data from context and tracking data passed in here
          merge(this.trackingData || {}, data || {})
        );
      };

      computeTrackingData(props, context) {
        this.ownTrackingData =
          typeof trackingData === 'function'
            ? trackingData(props)
            : trackingData;
        this.contextTrackingData =
          (context.tracking && context.tracking.data) || {};
        this.trackingData = merge(
          this.contextTrackingData || {},
          this.ownTrackingData || {}
        );
      }

      render() {
        return (
          <ReactTrackingContext.Provider value={this.getContextForProvider()}>
            <DecoratedComponent {...this.props} tracking={this.tracking} />
          </ReactTrackingContext.Provider>
        );
      }
    }

    hoistNonReactStatic(WithTracking, DecoratedComponent);

    return WithTracking;
  };
}
