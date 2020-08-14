/* eslint-disable no-unused-vars */
export default function dispatchTrackingEvent(data, _props) {
  if (Object.keys(data).length > 0) {
    (window.dataLayer = window.dataLayer || []).push(data);
  }
}
