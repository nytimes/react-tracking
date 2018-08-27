export default function dispatchTrackingEvent(data) {
  if (Object.keys(data).length > 0) {
    (window.dataLayer = window.dataLayer || []).push(data);
  }
}
