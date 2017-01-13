import withTrackingComponentDecorator from './withTrackingComponentDecorator';
import trackEventMethodDecorator from './trackEventMethodDecorator';

function handle(trackingInfo, ...toDecorate) {
  if (toDecorate.length === 1) {
    // decorating a class
    return withTrackingComponentDecorator(trackingInfo)(...toDecorate);
  }

  // decorating a method
  return trackEventMethodDecorator(trackingInfo)(...toDecorate);
}

export default function hoc(trackingInfo) {
  return function decorator(...toDecorate) {
    return handle(trackingInfo, ...toDecorate);
  };
}
