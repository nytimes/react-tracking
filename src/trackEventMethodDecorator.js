import makeClassMemberDecorator from './makeClassMemberDecorator';

export default function trackEventMethodDecorator(trackingData = {}) {
    return makeClassMemberDecorator(decoratedFn => function () {
        if (this.props && typeof this.props.trackEvent === 'function') {
            const thisTrackingData = typeof trackingData === 'function'
                ? trackingData(this.props, arguments)
                : trackingData;
            this.props.trackEvent(thisTrackingData);
        }

        return Reflect.apply(decoratedFn, this, arguments);
    });
}
