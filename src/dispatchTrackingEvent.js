import CustomEvent from 'custom-event';

export default function dispatchTrackingEvent(data) {
  document.dispatchEvent(new CustomEvent('FirehoseTrackingEvent', {
    detail: data,
  }));
}
