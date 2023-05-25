export default function dispatchTrackingEvent(data) {
  if (typeof window !== 'undefined' && Object.keys(data).length > 0) {
    (window.dataLayer = window.dataLayer || []).push(data);
  }
}
