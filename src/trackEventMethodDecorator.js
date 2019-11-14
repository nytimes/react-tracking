import makeClassMemberDecorator from './makeClassMemberDecorator';

export default function trackEventMethodDecorator(trackingData = {}) {
  return makeClassMemberDecorator(
    decoratedFn =>
      function decorateClassMember(...args) {
        const trackEvent = (...promiseArguments) => {
          if (
            this.props &&
            this.props.tracking &&
            typeof this.props.tracking.trackEvent === 'function'
          ) {
            const thisTrackingData =
              typeof trackingData === 'function'
                ? trackingData(this.props, this.state, args, promiseArguments)
                : trackingData;
            if (thisTrackingData) {
              this.props.tracking.trackEvent(thisTrackingData);
            }
          }
        };

        const fn = Reflect.apply(decoratedFn, this, args);
        if (Promise && Promise.resolve(fn) === fn) {
          return fn
            .then(trackEvent.bind(this))
            .then(() => {
              return fn;
            })
            .catch(error => {
              trackEvent(null, error);
              throw error;
            });
        }
        trackEvent();
        return fn;
      }
  );
}
