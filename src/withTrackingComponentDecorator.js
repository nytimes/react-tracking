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

        if (this.getProcessFn() && process) {
          // eslint-disable-next-line
          console.error(
            '[react-tracking] options.process should be defined once on a top-level component'
          );
        }

        this.tracking = {
          trackEvent: this.trackEvent,
          getTrackingData: this.getTrackingDataFn(),
        };

        this.contextValueForProvider = {
          tracking: {
            dispatch: this.getTrackingDispatcher(),
            getTrackingData: this.getTrackingDataFn(),
            process: this.getProcessFn() || process,
          },
        };
      }

      componentDidMount() {
        const contextProcess = this.getProcessFn();

        if (
          typeof contextProcess === 'function' &&
          typeof dispatchOnMount === 'function'
        ) {
          this.trackEvent(
            merge(
              contextProcess(this.getOwnTrackingData()) || {},
              dispatchOnMount(this.tracking.getTrackingData()) || {}
            )
          );
        } else if (typeof contextProcess === 'function') {
          const processed = contextProcess(this.getOwnTrackingData());
          if (processed || dispatchOnMount === true) {
            this.trackEvent(processed);
          }
        } else if (typeof dispatchOnMount === 'function') {
          this.trackEvent(dispatchOnMount(this.tracking.getTrackingData()));
        } else if (dispatchOnMount === true) {
          this.trackEvent();
        }
      }

      getProcessFn = () => {
        const { tracking } = this.context;
        return tracking && tracking.process;
      };

      getOwnTrackingData = () => {
        const ownTrackingData =
          typeof trackingData === 'function'
            ? trackingData(this.props)
            : trackingData;
        return ownTrackingData || {};
      };

      getTrackingDataFn = () => {
        const { tracking } = this.context;
        const contextGetTrackingData =
          (tracking && tracking.getTrackingData) || this.getOwnTrackingData;

        return () =>
          contextGetTrackingData === this.getOwnTrackingData
            ? this.getOwnTrackingData()
            : merge(contextGetTrackingData(), this.getOwnTrackingData());
      };

      getTrackingDispatcher = () => {
        const { tracking } = this.context;
        const contextDispatch = (tracking && tracking.dispatch) || dispatch;
        return data =>
          contextDispatch(merge(this.getOwnTrackingData(), data || {}));
      };

      trackEvent = (data = {}) => {
        this.contextValueForProvider.tracking.dispatch(data);
      };

      render() {
        return (
          <ReactTrackingContext.Provider value={this.contextValueForProvider}>
            <DecoratedComponent {...this.props} tracking={this.tracking} />
          </ReactTrackingContext.Provider>
        );
      }
    }

    hoistNonReactStatic(WithTracking, DecoratedComponent);

    return WithTracking;
  };
}
