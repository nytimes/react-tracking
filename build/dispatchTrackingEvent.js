"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dispatchTrackingEvent;
function dispatchTrackingEvent(data) {
  (window.dataLayer = window.dataLayer || []).push(data);
}