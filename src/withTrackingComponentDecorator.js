import React, { Component } from 'react';
import PropTypes from 'prop-types';
import deepmerge from 'deepmerge';
import hoistNonReactStatic from 'hoist-non-react-statics';

import dispatchTrackingEvent from './dispatchTrackingEvent';

export const TrackingContextType = PropTypes.shape({
  data: PropTypes.object,
  dispatch: PropTypes.func,
  process: PropTypes.func,
  merge: PropTypes.func,
});

export const ReactTrackingContext = React.createContext({});

export default function withTrackingComponentDecorator(
  trackingData = {},
  {
    dispatch = dispatchTrackingEvent,
    dispatchOnMount = false,
    process,
    merge,
  } = {}
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
            '[react-tracking] options.process should be defined once on a top-level component'
          );
        }

        if (context.tracking && context.tracking.merge && merge) {
          // eslint-disable-next-line
          console.error(
            '[react-tracking] options.merge should be defined once on a top-level component'
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
        const contextMerge = (tracking && tracking.merge) || deepmerge;
        if (
          typeof contextProcess === 'function' &&
          typeof dispatchOnMount === 'function'
        ) {
          this.trackEvent(
            contextMerge(
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
            data: this.trackingData,
            dispatch: this.getTrackingDispatcher(),
            process: (tracking && tracking.process) || process,
            merge: this.getTrackingMerge(),
          },
        };
      }

      getTrackingDispatcher() {
        const { tracking } = this.context;
        return (tracking && tracking.dispatch) || dispatch;
      }

      getTrackingMerge() {
        const { tracking } = this.context;
        return (tracking && tracking.merge) || merge;
      }

      trackEvent = data => {
        this.getTrackingDispatcher()(
          // deep-merge tracking data from context and tracking data passed in here
          deepmerge(this.trackingData || {}, data || {})
        );
      };

      computeTrackingData(props, context) {
        const { tracking } = context;
        const contextMerge = (tracking && tracking.merge) || deepmerge;

        this.ownTrackingData =
          typeof trackingData === 'function'
            ? trackingData(props)
            : trackingData;
        this.contextTrackingData =
          (context.tracking && context.tracking.data) || {};
        this.trackingData = contextMerge(
          this.contextTrackingData || {},
          this.ownTrackingData || {}
        );

        this.contextForProvider = this.getContextForProvider();
      }

      render() {
        return (
          <ReactTrackingContext.Provider value={this.contextForProvider}>
            <DecoratedComponent {...this.props} tracking={this.tracking} />
          </ReactTrackingContext.Provider>
        );
      }
    }

    hoistNonReactStatic(WithTracking, DecoratedComponent);

    return WithTracking;
  };
}
