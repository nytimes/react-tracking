/*
  React 16 expects reqeustAnimationFrame to be present,
  including in test environments.

  https://github.com/facebook/jest/issues/4545
*/
const raf = (global.requestAnimationFrame = callback => {
  setTimeout(callback, 0);
});

export default raf;
