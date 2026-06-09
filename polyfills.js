/**
 * Polyfills for React 19 compatibility
 * React 19 removed __extends helper, so we provide it here for compatibility
 * This must be loaded before any other code that might use __extends
 */

(function(global) {
  'use strict';

  // Polyfill for __extends helper used by TypeScript class inheritance
  // This is the standard TypeScript __extends implementation
  var __extends = function (d, b) {
    for (var p in b) {
      if (b.hasOwnProperty(p)) {
        d[p] = b[p];
      }
    }
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null 
      ? Object.create(b) 
      : ((__.prototype = b.prototype), new __());
  };

  // Make __extends available globally (must be before any other code runs)
  global.__extends = __extends;

  // Also make it available on window (for web compatibility)
  if (typeof global.window !== 'undefined') {
    global.window.__extends = __extends;
  }

  // Try to add __extends to React when it becomes available
  // This helps with code that expects React.__extends
  var attachToReact = function() {
    try {
      // Check common ways React might be accessed
      var React = global.React;
      if (React && typeof React === 'object') {
        try {
          if (typeof React.__extends === 'undefined') {
            React.__extends = __extends;
          }
        } catch (e) {
          // React might be frozen, that's okay - global __extends will work
        }
      }
    } catch (e) {
      // Ignore errors
    }
  };

  // Try to attach to React immediately (in case it's already loaded)
  attachToReact();

  // Also try after a microtask (in case React loads asynchronously)
  if (typeof global.Promise !== 'undefined') {
    Promise.resolve().then(attachToReact);
  }

  // Fallback: try after a short delay
  if (typeof global.setTimeout !== 'undefined') {
    setTimeout(attachToReact, 0);
  }
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this);

