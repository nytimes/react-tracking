/* eslint-disable prefer-rest-params */
import makeClassMemberDecorator from './makeClassMemberDecorator';

export default function trackEventMethodDecorator(trackingData = {}) {
  return makeClassMemberDecorator(
    decoratedFn =>
      function decorateClassMember() {
        const trackEvent = () => {
          if (
            this.props &&
            this.props.tracking &&
            typeof this.props.tracking.trackEvent === 'function'
          ) {
            const thisTrackingData =
              typeof trackingData === 'function'
                ? trackingData(this.props, this.state, arguments)
                : trackingData;
            this.props.tracking.trackEvent(thisTrackingData);
          }
        };

        const fn = Reflect.apply(decoratedFn, this, arguments);
        if (Promise && Promise.resolve(fn) === fn) {
          return fn.then(trackEvent.bind(this), trackEvent.bind(this));
        }
        trackEvent();
        return fn;
      }
  );
}
