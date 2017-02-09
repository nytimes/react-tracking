import withTrackingComponentDecorator from './withTrackingComponentDecorator';
import trackEventMethodDecorator from './trackEventMethodDecorator';

function handle(trackingInfo, options, ...toDecorate) {
  if (toDecorate.length === 1) {
    // decorating a class
    return withTrackingComponentDecorator(trackingInfo, options)(...toDecorate);
  }

  // decorating a method
  return trackEventMethodDecorator(trackingInfo)(...toDecorate);
}

export default function hoc(trackingInfo, options) {
  return function decorator(...toDecorate) {
    return handle(trackingInfo, options, ...toDecorate);
  };
}
